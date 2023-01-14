import MuiTable from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { ITable } from "Types/Interfaces";
import { useEffect } from "react";
import { Typography } from "@mui/material";
import theme from "theme";

export interface ITableProps extends ITable {}

export default function Table({ tableHeader, body }: ITableProps) {
  useEffect(() => {
    const isRowCorrectSize = body.every(
      (row) => row.length <= tableHeader.length
    );
    if (process.env.NODE_ENV === "development" && !isRowCorrectSize) {
      console.warn("Table Body Elements exceed the number of header elements");
    }
  });

  const headerRow = tableHeader.map((cell) => (
    <TableCell key={cell}>
      <Typography>{cell}</Typography>
    </TableCell>
  ));
  const bodyRows = body.map((row, index) => (
    <TableRow key={index}>
      {row.map((row) => (
        <TableCell key={row}>
          <Typography>{row}</Typography>
        </TableCell>
      ))}
    </TableRow>
  ));
  return (
    <TableContainer component={Paper} sx={{ maxWidth: "96vw" }}>
      <MuiTable>
        <TableHead sx={{ backgroundColor: theme.palette.primary.light }}>
          <TableRow>{headerRow}</TableRow>
        </TableHead>
        <TableBody>{bodyRows}</TableBody>
      </MuiTable>
    </TableContainer>
  );
}
