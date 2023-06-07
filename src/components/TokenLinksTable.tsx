"use client";

import { Link } from "@prisma/client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { SUPPORTED_SPL_TOKENS, TOKEN_SOL } from "@/lib/tokens";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { ClipboardIcon, ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";
import DeleteLinkDialog from "./DeleteLinkDialog";
import { useSession } from "next-auth/react";

interface TokenLinksTableProps {
  links: Link[];
}

const TokenLinksTable = ({ links }: TokenLinksTableProps) => {
  const columnHelper = createColumnHelper<Link>();

  const { data: user } = useSession();

  const columns = [
    columnHelper.accessor("amount", {
      id: "amount",
      header: "Amount",
      cell: (info) => {
        const value = info.getValue();
        const isSOL = info.row.original.token === "SOL";
        const symbol = isSOL ? "SOL" : (info.row.original.symbol as string);

        return (
          <div className="flex items-center justify-center gap-2 -ml-2">
            <img
              src={
                isSOL
                  ? TOKEN_SOL.logoURI
                  : SUPPORTED_SPL_TOKENS[
                      symbol as keyof typeof SUPPORTED_SPL_TOKENS
                    ].logoURI
              }
              alt={symbol}
              className="w-8 h-8 rounded-lg"
            />
            <div className="flex items-center justify-center gap-1">
              <span>{value}</span>
              <span>{symbol}</span>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("claimed", {
      id: "claimed",
      header: "Claimed",
      cell: (info) =>
        info.getValue() ? (
          <Badge>Claimed</Badge>
        ) : (
          <Badge variant="outline">Not claimed</Badge>
        ),
    }),
    columnHelper.accessor("claimedAt", {
      id: "claimedAt",
      header: "Claimed At",
      cell: (info) => {
        const value = info.getValue();
        return value ? <span>{format(value, "PPpp")}</span> : <span>-</span>;
      },
    }),
    columnHelper.accessor("createdAt", {
      id: "createdAt",
      header: "Created At",
      cell: (info) => <span>{format(info.getValue(), "PPpp")}</span>,
    }),
    columnHelper.accessor("message", {
      id: "message",
      header: "Message",
      cell: (info) => (
        <p className="w-32 text-sm break-words">{info.getValue() || "-"}</p>
      ),
    }),
    columnHelper.accessor("id", {
      id: "actions",
      header: "",
      cell: (info) => {
        const id = info.getValue();
        const claimed = info.row.original.claimed;

        return (
          <TableCell key="actions">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  window.open(
                    window.location.origin + "/claim/token/" + id,
                    "_blank"
                  );
                }}
              >
                <ExternalLinkIcon className="w-4 h-4 mr-2" />
                Open
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    window.location.origin + "/claim/token/" + id
                  );
                  toast.success("Copied to clipboard");
                }}
              >
                <ClipboardIcon className="w-4 h-4 mr-2" />
                Copy
              </Button>

              <DeleteLinkDialog id={id} claimed={claimed} />
            </div>
          </TableCell>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: links.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  return (
    user &&
    (links.length > 0 ? (
      <div className="w-full p-4 mt-8 overflow-x-auto border rounded-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    ) : (
      <p className="mt-8 text-xl text-center text-muted-foreground">
        You don&apos;t have any links yet. Create one by clicking on the button
        above.
      </p>
    ))
  );
};

export default TokenLinksTable;
