// スプレッドシートのCSV出力用URL（/pubhtml を /pub?output=csv に変更）
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZKROUq0exhwwbeL5fIM4u-rEqUu2W8BxSJofYyM18oqj-e3_QidR_80ed77On3Q/pub?output=csv';

/**
 * セル内の改行やカンマにも対応する軽量CSVパーサー
 */
function parseCSV(text: string): string[][] {
    const result: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentValue = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"' && inQuotes && nextChar === '"') {
            currentValue += '"';
            i++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            row.push(currentValue);
            currentValue = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') {
                i++;
            }
            row.push(currentValue);
            result.push(row);
            row = [];
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    if (currentValue !== '' || row.length > 0) {
        row.push(currentValue);
        result.push(row);
    }
    
    return result.filter(row => row.join('').trim() !== '');
}

/**
 * データをFetchしてHTMLに描画する
 */
async function loadShopData(): Promise<void> {
    try {
        const response = await fetch(SHEET_CSV_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        const data = parseCSV(csvText);
        
        const shopList = data.slice(1);

        const dlElement = document.querySelector('dl');
        if (!dlElement) return;

        const existingDds = dlElement.querySelectorAll('dd');
        existingDds.forEach(dd => dd.remove());

        shopList.forEach(row => {
            const [name = '', address = '', hours = '', holiday = ''] = row;
            const shopData = [name, address, hours, holiday];
            
            shopData.forEach(text => {
                const dd = document.createElement('dd');
                dd.className = 'text-center py-2 whitespace-pre-wrap';
                dd.textContent = text;
                dlElement.appendChild(dd);
            });
        });

    } catch (error) {
        console.error('店舗情報の読み込みに失敗しました:', error);
    }
}

loadShopData();