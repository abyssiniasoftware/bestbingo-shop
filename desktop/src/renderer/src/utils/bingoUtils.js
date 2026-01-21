import * as XLSX from "xlsx";
import { bingoRanges } from "../constants/bingo";

export const validateInput = (key, value) => {
  const num = parseInt(value, 10);
  if (value === "" || isNaN(num)) return false;
  const letter = key[0];
  if (key === "n3") return num === 0;
  const [min, max] = bingoRanges[letter] || [1, 75];
  return num >= min && num <= max;
};

export const parseCSV = (text) => {
  const rows = text.split("\n").filter((row) => row.trim());
  const headers = rows[0].split(",");
  return rows.slice(1).map((row) => {
    const values = row.split(",");
    return headers.reduce((obj, header, i) => {
      const trimmedHeader = header.trim();
      obj[trimmedHeader] = isNaN(values[i])
        ? values[i]?.trim()
        : parseInt(values[i], 10);
      return obj;
    }, {});
  });
};

export const normalizeJson = (data) => {
  if (Array.isArray(data)) {
    return data;
  } else if (typeof data === "object" && data !== null) {
    return Object.keys(data).map((key) => {
      const numbers = data[key];
      return {
        cardId: key,
        b1: numbers[0],
        b2: numbers[1],
        b3: numbers[2],
        b4: numbers[3],
        b5: numbers[4],
        i1: numbers[5],
        i2: numbers[6],
        i3: numbers[7],
        i4: numbers[8],
        i5: numbers[9],
        n1: numbers[10],
        n2: numbers[11],
        n3: numbers[12],
        n4: numbers[13],
        n5: numbers[14],
        g1: numbers[15],
        g2: numbers[16],
        g3: numbers[17],
        g4: numbers[18],
        g5: numbers[19],
        o1: numbers[20],
        o2: numbers[21],
        o3: numbers[22],
        o4: numbers[23],
        o5: numbers[24],
        userId: "userId",
      };
    });
  }
  return [];
};

export const parseFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data;
        if (file.name.endsWith(".json")) {
          data = JSON.parse(e.target.result);
          data = normalizeJson(data);
        } else if (file.name.endsWith(".csv")) {
          data = parseCSV(e.target.result);
        } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          const arrayData = new Uint8Array(e.target.result);
          const workbook = XLSX.read(arrayData, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          data = XLSX.utils.sheet_to_json(sheet);
        } else {
          reject(new Error("Unsupported file format"));
          return;
        }
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => {
      reject(err);
    };
    if (file.name.endsWith(".json") || file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};
