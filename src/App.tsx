
import './App.css'
import { useState } from 'react';
import DataProcessor from './DataProcessing'
import FileDrop from './FileDrop'
import DownloadTable from './DownloadTable';
import type { DataProcessorProps, OutputRow } from './DataProcessing';

function App() {
  const [file, setFile] = useState<DataProcessorProps["file"]>(null);
  const [shiftMode, setShift] = useState<DataProcessorProps["shiftMode"]>("auto");
  const [rows, setRows] = useState<OutputRow[]>([]);

  const ready = shiftMode !== "auto";

  return (
    <>
      <div>
        <h1>Punch CSV Converter</h1>
        <div className={`filedrop ${!ready ? "filedrop-error" : ""}`}>
          <FileDrop onFile={setFile}/>
        </div>
        

        <div className='select-box'>
          <label className='label-select'>Shift Mode:</label>
          <select className={`select ${!ready ? "select--error" : ""}`} value={shiftMode} onChange={e => setShift(e.target.value as any)}>
            <option className='option' value="auto">select</option>
            <option className='option-day' value="day">Day</option>
            <option className='option-night' value="night">Night</option>
          </select>
        </div>

        {ready && file && (
          <DataProcessor file={file} shiftMode={shiftMode} onProcessed={setRows}/>
        )}
        {!ready && (
          <p className="warning">
            ⚠️ Please choose Day or Night to proceed.
          </p>
        )}

        {ready && !rows.length && (
          <p>
            Please drop in a file 🗃️
          </p>
        )}

        {ready && (
          <DownloadTable rows={rows}/>
        )}
      </div>
    </>
  )
}

export default App
