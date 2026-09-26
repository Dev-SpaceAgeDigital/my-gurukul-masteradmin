import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies('ADMIN');
    if (!session || session.role !== 'SUB_ADMIN' || !session.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const hasValidExtension = /\.(xlsx|xls)$/i.test(file.name);
    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      return NextResponse.json({ error: 'Only .xlsx or .xls files are allowed' }, { status: 400 });
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: 'Excel file must be 5MB or smaller' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get raw data with headers (Row 1 is actual headers)
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (rawData.length < 2) {
      return NextResponse.json({ error: 'Excel file is empty or missing headers' }, { status: 400 });
    }

    const headers = (rawData[1] as string[]).map(h => h ? h.trim() : h);
    const rows = rawData.slice(2);

    const maxRows = 1000;
    if (rows.length > maxRows) {
      return NextResponse.json({ error: `Please import ${maxRows} students or fewer at one time` }, { status: 400 });
    }

    // Map rows to structured objects
    const students = rows.map((row: any) => {
      const student: any = {};
      headers.forEach((header, index) => {
        if (header) {
          student[header] = row[index] !== undefined ? row[index] : null;
        }
      });
      return student;
    });

    return NextResponse.json({ 
      headers: headers.filter(h => h !== null && h !== undefined), 
      students 
    });

  } catch (error) {
    console.error('Excel import error:', error);
    return NextResponse.json({ error: 'Failed to process Excel file' }, { status: 500 });
  }
}
