import fs from 'fs';

const path = 'src/pages/public/BasketballHome.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace colors
content = content.replace(/text-cyan-400/g, 'text-amber-500');
content = content.replace(/bg-cyan-400/g, 'bg-amber-500');
content = content.replace(/border-cyan-400/g, 'border-amber-500');
content = content.replace(/rgba\(34,211,238/g, 'rgba(245,158,11');

// Replace Football terms with Basketball
content = content.replace(/V\. MORRETI/g, 'W. ARAKJI');
content = content.replace(/J\. ALVAREZ/g, 'A. HAIDAR');
content = content.replace(/L\. HENRIQUE/g, 'AMIR SAOUD');
content = content.replace(/S\. AL-FARAH/g, 'KARIM ZEINOUN');
content = content.replace(/K\. HANSEN/g, 'ALI MANSOUR');
content = content.replace(/A\. COSTA/g, 'SERGIO EL DARWICH');
content = content.replace(/PSG/g, 'RIY');
content = content.replace(/MIL/g, 'SAG');
content = content.replace(/BAY/g, 'DYN');
content = content.replace(/RMA/g, 'BEI');
content = content.replace(/ALN/g, 'ANT');
content = content.replace(/FRA-LIG1/g, 'LBN-LBL');
content = content.replace(/ITA-SERA/g, 'LBN-LBL');
content = content.replace(/GER-BUND/g, 'LBN-LBL');
content = content.replace(/ESP-LIGA/g, 'LBN-LBL');
content = content.replace(/SAU-PRO/g, 'LBN-LBL');
content = content.replace(/ENG-PREM/g, 'LBN-LBL');
content = content.replace(/FWD/g, 'PG');
content = content.replace(/MID/g, 'SG');
content = content.replace(/DEF/g, 'C');

// Replace Stats
content = content.replace(/THREAT XG/g, 'REBOUNDS');
content = content.replace(/GOALS/g, 'POINTS');

fs.writeFileSync(path, content, 'utf8');
