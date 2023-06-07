"use client";

import { CandyMachineLink } from "@prisma/client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ClipboardIcon, ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";
import DeleteLinkDialog from "./DeleteLinkDialog";

interface CandyMachineLinksTableProps {
  candyMachineLinks: CandyMachineLink[];
}

const CandyMachineLinksTable = ({
  candyMachineLinks,
}: CandyMachineLinksTableProps) => {
  const columnHelper = createColumnHelper<CandyMachineLink>();

  const { data: user } = useSession();

  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      header: "Name",
      cell: (info) => (
        <p className="w-24 break-words text-md">{info.getValue()}</p>
      ),
    }),
    columnHelper.accessor("description", {
      id: "description",
      header: "Description",
      cell: (info) => (
        <p className="w-24 break-words text-md">{info.getValue() || "-"}</p>
      ),
    }),

    columnHelper.accessor("alreadyMinted", {
      id: "availableMintedTotal",
      header: "Available / Minted / Total",
      cell: (info) => {
        const alreadyMinted = info.getValue();
        const available = info.row.original.size - alreadyMinted;
        const total = info.row.original.size;

        return (
          <p className="break-words text-md">
            {available} / {alreadyMinted} / {total}
          </p>
        );
      },
    }),
    columnHelper.accessor("message", {
      id: "message",
      header: "Message",
      cell: (info) => (
        <p className="w-24 break-words text-md">{info.getValue() || "-"}</p>
      ),
    }),
    columnHelper.accessor("externalUrl", {
      id: "externalUrl",
      header: "External URL",
      cell: (info) => {
        const value = info.getValue();

        return value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="w-24 break-words text-md"
          >
            {value}
          </a>
        ) : (
          <p className="w-24 break-words text-md">-</p>
        );
      },
    }),
    columnHelper.accessor("network", {
      id: "network",
      header: "Network",
      cell: (info) =>
        info.getValue() === "mainnet-beta" ? (
          <Badge>Mainnet</Badge>
        ) : (
          <Badge className="bg-green-700">Devnet</Badge>
        ),
    }),
    columnHelper.accessor("createdAt", {
      id: "createdAt",
      header: "Created At",
      cell: (info) => <span>{format(info.getValue(), "PPpp")}</span>,
    }),
    columnHelper.accessor("id", {
      id: "actions",
      header: "",
      cell: (info) => {
        const id = info.getValue();

        return (
          <TableCell key="actions">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  window.open(
                    window.location.origin + "/claim/candymachine/" + id,
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
                    window.location.origin + "/claim/candymachine/" + id
                  );
                  toast.success("Copied to clipboard");
                }}
              >
                <ClipboardIcon className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </TableCell>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: candyMachineLinks.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    ),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  console.log(rows);

  return (
    user &&
    (candyMachineLinks.length > 0 ? (
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

export default CandyMachineLinksTable;
