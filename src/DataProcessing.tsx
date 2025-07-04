import React, { useEffect, useState } from "react";
import Papa from "papaparse";

export type RawRow = {
    'Person ID':         string;  
    'Person Name':       string;
    'Punch Date':        string;
    'Attendance record': string;
    'TimeZone':          string;
    'Source':            string;
}

export type OutputRow = {
    ID: string;
    'Person Name': string;
    'Punch Date': string;
    start_time: string;
    end_time: string;
    dt?: Date;
    shift_type: 'Day' | 'Night' | 'Incomplete';
}

export type DataProcessorProps = {
    file: File | null;
    shiftMode: "auto" | "day" | "night";
    onProcessed: (row: OutputRow[]) => void;
}

export type Punch = {
    dt: Date;
    timeStr: string;
    id: string;
    name: string;
}

const DataProcessor: React.FC<DataProcessorProps> = ({
    file,
    shiftMode,
    onProcessed
}) => {
    const [error, setError] = useState<string | null>(null);

    // const parsePuncher = (r: RawRow): Punch => {
    //     const [m, d, y] = r['Punch Date'].split('/').map(Number);
    //     const [h, mi, s] = r['Attendance record'].split(':').map(Number);
    //     return { dt: new Date(y, m - 1, d, h, mi, s), timeStr: r['Attendance record'] };
    // }

    const toMinutes = (time: string) => {
        const [h, m, s] = time.split(':').map(Number);
        return h*60 + m + s/60;
    }
    const classifyShift = (shiftMode: DataProcessorProps["shiftMode"]) => {
        return(start: string, end: string) => {
            if (!start || !end) return "Incomplete" as const;
            if(shiftMode === "day") return "Day" as const;
            if(shiftMode === "night") return "Night" as const;
            return toMinutes(start) < toMinutes(end) ? "Day" as const : "Night" as const;
        };
    };
    function parsePunch(row: RawRow): Date {

        const [y, m, d] = row['Punch Date'].split("-").map(Number);
        const [h, mi, s] = row['Attendance record'].split(":").map(Number);
        return new Date(y, m - 1, d, h, mi, s);
        return new Date(`${row['Punch Date']}T${row['Attendance record']}`);

    }
    function pad(n: number): string {
        return n < 10 ? '0' + n : String(n);
    }

    useEffect(() => {
        if (!file) return;
        setError(null);

        Papa.parse<RawRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: ({ data, errors }) => {
                if(errors.length){
                    setError(errors.map(e => e.message).join("; "));
                    return;
                }

                const groups = new Map<
                string,
                {
                    meta: Omit<OutputRow, 'start_time' | 'end_time' | 'shift_type'>;
                    times: string[];
                }>();

                data.forEach(r => {
                    const key = `${r["Person ID"].trim()}__${r["Punch Date"].trim()}`;
                    if(!groups.has(key)){
                        groups.set(key, {
                            meta: {
                                ID: r['Person ID'],
                                'Person Name': r['Person Name'],
                                'Punch Date': r['Punch Date'],
                                dt: parsePunch(r)
                            },
                            times: []
                        });
                    }
                    groups.get(key)!.times.push(r["Attendance record"]);
                });

                const classify = classifyShift(shiftMode);


                const out: OutputRow[] = [];
                for(const {meta, times} of groups.values()){
                    const sorted = times.sort((a,b) => toMinutes(a) - toMinutes(b));
                    const { dt, ...metaSansDt } = meta;
                    let start = "";
                    let end = "";

                    if(shiftMode === "night"){
                        const NOON = 60 * 12;
                        if(sorted.length){
                            start = sorted.find(t => toMinutes(t) > NOON) || "";
                            if(start){
                                const dtNext = new Date(dt!.getTime());
                                dtNext.setDate(dtNext.getDate() + 1);
                                const y = dtNext.getFullYear();
                                const m = pad(dtNext.getMonth() + 1);
                                const d = pad(dtNext.getDate());
                                const nextKey = `${meta.ID}__${y}-${m}-${d}`;
                                const tomorrowGroup = groups.get(nextKey);
                                end = tomorrowGroup?.times.find(t => toMinutes(t) < NOON) || "";
                            }

                        }
                        if (start === "" && end === "") {
                            continue;
                        }
                    }else{
                        if(sorted.length === 1){
                            start = sorted[0];
                            end = "";
                        }else if(sorted.length > 1){
                            start = sorted[0];
                            end = sorted[sorted.length - 1];
                        }
                    }
                    
                    
                    out.push({
                        ...metaSansDt,
                        start_time: start,
                        end_time: end,
                        shift_type: classify(start, end)
                    });
                }
                onProcessed(out);
            }, error: err => setError(err.message)
        });
    }, [ file, shiftMode, onProcessed ]);

    if(error){
        return <div style={{color: "red"}}>Error Parsing CSV Data: {error}</div>
    }
    return null;

}

export default DataProcessor;