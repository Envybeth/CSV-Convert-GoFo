import { useEffect, useRef } from 'react';
import type {OutputRow}  from './DataProcessing'

type Props = {
    rows: OutputRow[];
}

export default function DownloadTable({ rows }: Props){
    if(!rows.length) return null;

    const headers = Object.keys(rows[0]);
    const csv = [
        headers.join(','),
        ...rows.map(r => 
            headers.map(h => {
                const val = (r as any)[h];
                return typeof val==="string" && val.includes(',') ? `"${val}"` : val;
            }).join(',')
        )
    ].join('\n');

    const downloadRef = useRef<HTMLAnchorElement>(null);

    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);

    useEffect(() => {
        const el = downloadRef.current;
        if(!el) return;
        el.classList.add("downloaded");
        const tid = setTimeout(() => {
            el.classList.remove("downloaded");
        }, 200);

        return () => clearTimeout(tid);
    }, [url])
    

    return(
        <div>
            <a className='downloadA' ref={downloadRef} href={url} download="output.csv" >
                ⏬Download output.csv⏬
            </a>
        </div>
    );


}
