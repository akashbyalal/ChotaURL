import { useState } from 'react';
import axios from 'axios';
import QRCode from 'qrcode';
import './index.css';

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrImage, setQrImage] = useState('');

  const handleShorten = async () => {
    if (!url) return;

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const res = await axios.post(`${backendUrl}/api/short`, {
        originalUrl: url,
      });

      const newShortUrl = res?.data?.url?.shortUrl;

      if (!newShortUrl) {
        throw new Error('Backend did not return a short URL.');
      }

      setShortUrl(newShortUrl);
      setCopied(false);

      const qr = await QRCode.toDataURL(newShortUrl);
      setQrImage(qr);
    } catch (error) {
      console.error('Shorten failed:', error);
      alert(error?.response?.data?.error || error?.message || 'Something went wrong');
    }
  };

  const handleCopy = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } 

  return (
   <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
  <div className="w-full max-w-2xl">

    {/* Header */}
    <div className="text-center mb-10">
      <h1 className="text-5xl font-extrabold">
        Chota<span className="text-blue-500">URL</span>
      </h1>

      <p className="text-slate-400 mt-3">
        Turn long, ugly URLs into short and shareable links.
      </p>
    </div>

    {/* Card */}
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">

      <label className="block mb-2 text-sm font-medium text-slate-300">
        Enter your URL
      </label>

      <div className="flex gap-3">
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
        />

        <button
          onClick={handleShorten}
          className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl font-semibold transition"
        >
          Shorten
        </button>
      </div>

      {shortUrl && (
        <div className="mt-8 border-t border-slate-800 pt-6">

          <h2 className="text-lg font-semibold mb-4">
            Your Short URL
          </h2>

          <div className="flex gap-3">
            <input
              readOnly
              value={shortUrl}
              className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3"
            />

            <button
              onClick={handleCopy}
              className={`px-5 rounded-xl font-medium transition ${
                copied
                  ? "bg-green-600"
                  : "bg-slate-700 hover:bg-slate-600"
              }`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {qrImage && (
            <div className="mt-8 flex flex-col items-center">

              <img
                src={qrImage}
                alt="QR Code"
                className="bg-white p-4 rounded-xl w-48 h-48"
              />

              <a
                href={qrImage}
                download="ChotaURL-QR.png"
                className="mt-4 bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg"
              >
                Download QR
              </a>

            </div>
          )}
        </div>
      )}
    </div>

    <p className="text-center text-slate-500 text-sm mt-8">
      Built with React, Express, MongoDB and Tailwind CSS.
    </p>

  </div>
</main>
  )
}

export default App
