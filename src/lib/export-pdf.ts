import type { Student } from "@/hooks/use-students";

export function exportStudentsPdf(students: Student[]) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const rows = students
    .map(
      (s) => `
    <tr>
      <td>${s.avatar || ""}</td>
      <td>${s.name}</td>
      <td>${s.register_number}</td>
      <td>${s.email || "-"}</td>
      <td>${s.phone || "-"}</td>
      <td>${s.grade || "-"}</td>
      <td>${s.section || "-"}</td>
      <td>${s.date_of_birth || "-"}</td>
      <td>${s.blood_group || "-"}</td>
      <td>${s.parent_name || "-"}</td>
      <td>${s.parent_phone || "-"}</td>
    </tr>`
    )
    .join("");

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Student List</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; padding: 20px; }
    h1 { font-size: 22px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
    th { background: #1e3a5f; color: white; }
    tr:nth-child(even) { background: #f9f9f9; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>📚 Class Student List (${students.length} students)</h1>
  <table>
    <thead>
      <tr>
        <th></th><th>Name</th><th>Reg #</th><th>Email</th><th>Phone</th>
        <th>Grade</th><th>Section</th><th>DOB</th><th>Blood</th>
        <th>Parent</th><th>Parent Phone</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`);

  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
}
