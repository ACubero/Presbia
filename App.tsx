import React, { useState, useEffect, useRef } from 'react';
import { extractTextFromImage } from './services/geminiService';
import { saveScan, getAllScans, clearHistory, deleteScan, importData } from './services/db';
import { ScanRecord, AppSettings, ThemeMode, ViewState } from './types';
import { Button, Header, IconButton } from './components/UIComponents';

// --- ICONS (SVG Components) ---
const Icons = {
  Camera: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>,
  Upload: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>,
  History: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Settings: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Trash: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
  ZoomIn: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" /></svg>,
  ZoomOut: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13 10H7" /></svg>,
  Text: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  Image: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>,
  Download: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
  Restore: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>,
  Font: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" /></svg>,
  Close: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
};

// --- PINCH ZOOM COMPONENT ---
interface PinchZoomProps {
  src: string;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
}

const PinchZoomImage: React.FC<PinchZoomProps> = ({ src, zoom, onZoomChange }) => {
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchRef = useRef<{ dist: number; x: number; y: number } | null>(null);

  useEffect(() => {
    // Reset pan on new image
    setTranslate({ x: 0, y: 0 });
  }, [src]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      lastTouchRef.current = { 
        dist: 0, 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchRef.current = { dist, x: 0, y: 0 };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && lastTouchRef.current) {
       const dx = e.touches[0].clientX - lastTouchRef.current.x;
       const dy = e.touches[0].clientY - lastTouchRef.current.y;
       
       setTranslate(p => ({ x: p.x + dx, y: p.y + dy }));
       
       lastTouchRef.current.x = e.touches[0].clientX;
       lastTouchRef.current.y = e.touches[0].clientY;
    } else if (e.touches.length === 2 && lastTouchRef.current) {
       const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      if (lastTouchRef.current.dist > 0) {
        const delta = dist - lastTouchRef.current.dist;
        const newZoom = zoom + (delta * 0.01);
        onZoomChange(Math.max(1, Math.min(newZoom, 5)));
      }
      lastTouchRef.current.dist = dist;
    }
  };

  return (
    <div 
        ref={containerRef}
        className="w-full h-full overflow-hidden bg-black/5 dark:bg-black/20 touch-none flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => { lastTouchRef.current = null; }}
    >
       <img 
         src={src} 
         alt="Zoomable content" 
         className="max-w-full max-h-full object-contain transition-transform duration-75 ease-linear will-change-transform"
         style={{ 
           transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoom})` 
         }}
       />
    </div>
  );
};


export default function App() {
  // State
  const [view, setView] = useState<ViewState>('HOME');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<string | null>(null); // For display context
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // View specific state
  const [resultTab, setResultTab] = useState<'text' | 'image'>('text');
  const [imageZoom, setImageZoom] = useState<number>(1);

  // Settings State (Persisted)
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('visionAssistSettings');
    return saved ? JSON.parse(saved) : { fontSize: 28, theme: ThemeMode.LIGHT }; // Default bigger font
  });

  // Persist settings effect
  useEffect(() => {
    localStorage.setItem('visionAssistSettings', JSON.stringify(settings));
  }, [settings]);

  // Load History Effect
  useEffect(() => {
    if (view === 'HISTORY') {
      loadHistory();
      setSearchTerm('');
    }
  }, [view]);

  const loadHistory = async () => {
    try {
      const data = await getAllScans();
      setHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Derived state for filtering
  const filteredHistory = history.filter(scan => 
    scan.extractedText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteItem = async (e: React.MouseEvent, id: number | undefined) => {
    // Prevent default anchor/button behavior
    e.preventDefault();
    // Stop propagation to prevent opening the detail view
    e.stopPropagation();

    if (id === undefined) {
        console.error("ID is undefined, cannot delete");
        return;
    }
    
    // Immediate deletion for better UX (no confirmation dialog blocking the user)
    try {
        await deleteScan(id);
        // Optimistically update UI
        setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
        console.error("Failed to delete", err);
        alert("Error al borrar el elemento.");
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setView('SCAN_RESULT');
    setResultTab('text');
    setImageZoom(1);
    setCurrentText(''); // Clear previous

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setCurrentImage(base64);
        
        try {
            const text = await extractTextFromImage(base64);
            setCurrentText(text);
            
            // Save to DB
            await saveScan({
                timestamp: Date.now(),
                originalImage: base64,
                extractedText: text
            });
        } catch (err: any) {
            setError(err.message || "Error al procesar la imagen");
        } finally {
            setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Error al leer el archivo");
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const data = await getAllScans();
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presbia-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            await importData(event.target?.result as string);
            alert("¡Copia de seguridad restaurada!");
            loadHistory();
        } catch(err) {
            alert("Error al restaurar.");
        }
    };
    reader.readAsText(file);
  };

  // Helper to get theme classes - Now includes "dark" class for Tailwind dark mode inheritance if needed
  const getThemeClasses = () => {
    switch (settings.theme) {
        case ThemeMode.DARK: return "dark bg-gray-900 text-white";
        case ThemeMode.HIGH_CONTRAST: return "bg-black text-yellow-300"; // Yellow on Black
        case ThemeMode.INVERTED: return "bg-yellow-300 text-black"; // Black on Yellow
        default: return "bg-white text-gray-900";
    }
  };

  const containerClasses = `flex flex-col h-full ${getThemeClasses()} transition-colors duration-300`;

  // Views
  const renderHome = () => (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center items-center gap-6 min-h-[400px]">
        <div className="text-center mb-2">
            <span className="text-7xl mb-4 block" role="img" aria-label="ojo">👁️</span>
            <h1 className="text-5xl font-bold mb-2 tracking-tight">PresbIA</h1>
        </div>
        
        <div className="w-full max-w-md space-y-6 flex flex-col justify-center">
            <label className="block">
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
            <div className="bg-blue-600 text-white rounded-3xl p-8 text-center shadow-lg active:scale-95 transition-transform cursor-pointer flex flex-col items-center gap-3">
                {Icons.Camera}
                <span className="text-3xl font-bold">Hacer Foto</span>
            </div>
            </label>

            <label className="block">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <div className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-3xl p-6 text-center shadow active:scale-95 transition-transform cursor-pointer flex flex-col items-center gap-2">
                {Icons.Upload}
                <span className="text-2xl font-bold">Subir Imagen</span>
            </div>
            </label>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md pb-4">
            <Button variant="secondary" onClick={() => setView('HISTORY')} icon={Icons.History}>Historial</Button>
            <Button variant="secondary" onClick={() => setView('SETTINGS')} icon={Icons.Settings}>Ajustes</Button>
        </div>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Resultado" onBack={() => setView('HOME')} />
      
      {/* Tabs */}
      {!loading && !error && (
        <div className="flex border-b border-current/20 shrink-0">
          <button 
            className={`flex-1 p-4 text-center font-bold text-xl flex items-center justify-center gap-2 ${resultTab === 'text' ? 'border-b-4 border-blue-500 text-blue-600 dark:text-blue-400' : 'opacity-60'}`}
            onClick={() => setResultTab('text')}
          >
            {Icons.Text} Texto
          </button>
          <button 
            className={`flex-1 p-4 text-center font-bold text-xl flex items-center justify-center gap-2 ${resultTab === 'image' ? 'border-b-4 border-blue-500 text-blue-600 dark:text-blue-400' : 'opacity-60'}`}
            onClick={() => setResultTab('image')}
          >
            {Icons.Image} Imagen
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto relative bg-gray-50/50 dark:bg-gray-900/50 no-scrollbar">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="w-20 h-20 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-3xl animate-pulse font-medium">Leyendo texto...</p>
           </div>
        ) : error ? (
           <div className="text-center p-8 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-800 dark:text-red-200 m-4">
              <h3 className="text-2xl font-bold mb-2">Error</h3>
              <p className="text-lg">{error}</p>
              <Button className="mt-8 w-full" onClick={() => setView('HOME')}>Intentar de nuevo</Button>
           </div>
        ) : (
           <>
              {resultTab === 'text' ? (
                <div className="p-4 pb-40 selectable-text">
                  <div 
                    className="whitespace-pre-wrap leading-relaxed outline-none break-words" 
                    style={{ fontSize: `${settings.fontSize}px`, lineHeight: 1.5 }}
                  >
                    {currentText}
                  </div>
                </div>
              ) : (
                <PinchZoomImage 
                    src={currentImage || ''} 
                    zoom={imageZoom} 
                    onZoomChange={setImageZoom} 
                />
              )}
           </>
        )}
      </div>

      {/* Floating Controls */}
      {!loading && !error && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-black/95 backdrop-blur border-t border-current/20 flex justify-between items-center gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
             {resultTab === 'text' ? (
               <>
                 <IconButton onClick={() => setSettings(s => ({ ...s, fontSize: Math.max(16, s.fontSize - 4) }))}>
                    <span className="text-2xl font-bold">A-</span>
                 </IconButton>
                 <span className="text-xl font-bold w-12 text-center opacity-70">Tamaño</span>
                 <IconButton onClick={() => setSettings(s => ({ ...s, fontSize: Math.min(80, s.fontSize + 4) }))}>
                    <span className="text-4xl font-bold">A+</span>
                 </IconButton>
               </>
             ) : (
               <>
                 <IconButton onClick={() => setImageZoom(z => Math.max(0.5, z - 0.5))}>
                    {Icons.ZoomOut}
                 </IconButton>
                 <span className="text-xl font-bold w-12 text-center opacity-70">Zoom</span>
                 <IconButton onClick={() => setImageZoom(z => Math.min(5, z + 0.5))}>
                    {Icons.ZoomIn}
                 </IconButton>
               </>
             )}
          </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="flex flex-col h-full">
      <Header title="Historial" onBack={() => setView('HOME')} />
      <div className="flex-1 overflow-auto p-4 space-y-4 no-scrollbar">
        <div className="mb-4 relative">
           <input 
              type="text" 
              placeholder="Buscar en el historial..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pr-12 text-2xl font-medium rounded-xl border-4 bg-transparent border-current/30 focus:border-current outline-none transition-colors placeholder-current/50"
           />
           {searchTerm && (
             <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all"
             >
                {Icons.Close}
             </button>
           )}
        </div>

        {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-20 opacity-50">
                 {Icons.History}
                 <p className="text-2xl mt-4">{searchTerm ? "Sin resultados." : "Aún no hay escaneos."}</p>
            </div>
        ) : (
            filteredHistory.map((scan) => (
                <div 
                    key={scan.id} 
                    className="rounded-2xl border-2 border-current/20 bg-current/5 shadow-sm overflow-hidden flex items-stretch min-h-[8rem]"
                >
                    <button 
                        type="button"
                         onClick={() => {
                            setCurrentText(scan.extractedText);
                            setCurrentImage(scan.originalImage);
                            setResultTab('text');
                            setImageZoom(1);
                            setView('SCAN_RESULT');
                        }}
                        className="flex-1 text-left p-4 hover:bg-current/5 transition-colors flex flex-col gap-2 min-w-0"
                    >
                        <div className="flex justify-between text-sm opacity-60 font-medium">
                            <span>{new Date(scan.timestamp).toLocaleDateString()}</span>
                            <span>{new Date(scan.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="flex gap-4 items-start h-full">
                            {scan.originalImage && (
                            <div className="w-20 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                <img src={scan.originalImage} className="w-full h-full object-cover" alt="thumbnail" />
                            </div>
                            )}
                            <p className="line-clamp-3 text-2xl font-medium leading-snug break-words w-full">
                                {scan.extractedText || "Sin texto"}
                            </p>
                        </div>
                    </button>
                    
                    <div className="border-l-2 border-current/20 flex flex-col w-20 z-10">
                        <button 
                            type="button"
                            onClick={(e) => handleDeleteItem(e, scan.id)}
                            className={`flex-1 flex items-center justify-center transition-colors active:bg-red-200 ${
                                (settings.theme === ThemeMode.HIGH_CONTRAST || settings.theme === ThemeMode.INVERTED)
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60"
                            }`}
                            aria-label="Borrar elemento"
                        >
                            {Icons.Trash}
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="flex flex-col h-full">
      <Header title="Ajustes" onBack={() => setView('HOME')} />
      <div className="flex-1 overflow-auto p-6 space-y-10 no-scrollbar">
        
        <section>
          <h2 className="text-3xl font-bold mb-6">Apariencia</h2>
          <div className="grid grid-cols-2 gap-4">
             {[
                { label: 'Claro', val: ThemeMode.LIGHT, class: 'bg-white text-gray-900 border-gray-300' },
                { label: 'Oscuro', val: ThemeMode.DARK, class: 'bg-gray-900 text-white border-gray-700' },
                { label: 'Alto Contraste', val: ThemeMode.HIGH_CONTRAST, class: 'bg-black text-yellow-300 border-yellow-300' },
                { label: 'Inverted', val: ThemeMode.INVERTED, class: 'bg-yellow-300 text-black border-black' },
             ].map(t => (
                <button
                   key={t.val}
                   onClick={() => setSettings(s => ({ ...s, theme: t.val }))}
                   className={`p-6 rounded-2xl border-4 font-bold text-xl flex flex-col items-center justify-center gap-2 ${t.class} ${settings.theme === t.val ? 'ring-4 ring-blue-500 scale-[1.02]' : ''}`}
                >
                   <span className="text-4xl">Aa</span>
                   {t.label}
                </button>
             ))}
          </div>
        </section>

        <section>
           <h2 className="text-3xl font-bold mb-6">Tamaño de Fuente</h2>
           <div className="flex items-center gap-4 p-6 bg-gray-100 dark:bg-gray-800 rounded-2xl">
               <span className="text-xl font-bold">A</span>
               <input 
                  type="range" 
                  min="16" 
                  max="64" 
                  value={settings.fontSize} 
                  onChange={(e) => setSettings(s => ({ ...s, fontSize: Number(e.target.value) }))}
                  className="flex-1 h-12 w-full accent-blue-600"
               />
               <span className="text-4xl font-bold">A</span>
           </div>
           <p className="mt-4 text-center font-bold" style={{ fontSize: `${settings.fontSize}px` }}>
              Vista Previa
           </p>
        </section>

        <section>
           <h2 className="text-3xl font-bold mb-6">Datos</h2>
           <div className="space-y-6">
              <Button variant="secondary" className="w-full" onClick={handleExport} icon={Icons.Download}>
                 Copia de Seguridad (JSON)
              </Button>
              <label className="block w-full">
                  <span className="hidden">Restaurar Datos</span>
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 p-6 rounded-2xl text-center font-bold text-xl cursor-pointer hover:bg-blue-200 flex items-center justify-center gap-3 shadow-md">
                     {Icons.Restore}
                     Restaurar Datos
                  </div>
                  <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              </label>
           </div>
        </section>

      </div>
    </div>
  );

  return (
    <div className={containerClasses}>
       {view === 'HOME' && renderHome()}
       {view === 'SCAN_RESULT' && renderResult()}
       {view === 'HISTORY' && renderHistory()}
       {view === 'SETTINGS' && renderSettings()}
    </div>
  );
}