import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useState } from "react";
import { useEffect } from "react";
import fetchParticulars from "../../Helpers/ParticularsApi";
import { useContext } from "react";
import { AppContext } from "../Components/Context";
import ParticularsAccordion from "../Components/ParticularsAccordion";
import { FaPlus } from "react-icons/fa6";
import AddParticularsModal from "../Components/AddParticularsModal";
import { MdDelete } from "react-icons/md";

const Particulars = () => {
  const values = {
    Sl: String,
    template: {
      name: String,
      date: Date,
      owner: String,
    },
  };

  const { particulars, setParticulars, showupdated, setShowUpdated } =
    useContext(AppContext);
  const [showmodal, setShowmodal] = useState(false);
  useEffect(() => {
    const loadParticulars = async () => {
      try {
        const particulars = await fetchParticulars();
        setParticulars(particulars.Particulars);
      } catch (error) {}
    };
    loadParticulars();
  }, [showupdated]);

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("sl", {
      header: "Sl. No.",
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor("template", {
      id: "template.name",
      header: "Template Name",
      cell: (info) => info.getValue() || "-",
    }),

    columnHelper.accessor("particulars", {
      id: "template.particulars",
      header: "Particulars",
      cell: (info) => {
        const list = info.getValue();
        return <ParticularsAccordion items={list} />;
      },
    }),
    columnHelper.accessor("createdAt", {
      id: "template.date",
      header: "Created Date",
      cell: (info) => {
        const val = info.getValue();
        return val ? new Date(val).toLocaleDateString() : "-";
      },
    }),

    columnHelper.accessor("owner", {
      id: "template.owner",
      header: "Created By",
      cell: (info) => info.getValue() || "-",
    }),
  ];
  const table = useReactTable({
    data: particulars,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const latestDate =
    particulars.length > 0
      ? new Date(
          Math.max(...particulars.map((item) => new Date(item.createdAt)))
        )
      : null;
  const formattedLatestDate = latestDate
    ? latestDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

  return (
    <div>
      <div className="flex flex-col min-h-screen">
        <h1 className="text-2xl font-semibold text-gray-800 px-5 pt-5 pb-3 border-b border-gray-200">
          Customize Particulars
        </h1>

        <div className="bg-white shadow-md p-5">
          <div className="mt-2 flex items-center justify-between">
            <button
              className="flex items-center px-4 py-2 gap-2.5 bg-blue-600 text-white rounded shadow cursor-pointer"
              onClick={() => {
                setShowmodal(true);
                setShowUpdated(false);
              }}
            >
              <FaPlus /> New Template
            </button>
            {formattedLatestDate != "-" ? (
              <span className="text-sm text-gray-500">
                Last updated: {formattedLatestDate}
              </span>
            ) : (
              ""
            )}
          </div>
        </div>
        <section className="overflow-auto max-h-[calc(100vh-300px)]">
          <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="border-b border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700"
                    >
                      {header.isPlaceholder
                        ? null
                        : header.column.columnDef.header}
                    </th>
                  ))}
                  <th className="border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center">
                    Action
                  </th>
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-4 text-gray-500"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="even:bg-white odd:bg-gray-50 hover:bg-blue-100 cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="border-b border-gray-300 px-4 py-2 text-sm text-gray-700"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                    <td className="border-b border-gray-300 px-4 py-2 text-red-600 text-center">
                      <button
                        onClick={() => handleDelete(row.original)}
                        className="hover:text-red-800"
                      >
                        <MdDelete size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
      {showmodal && <AddParticularsModal setShowmodal={setShowmodal} />}
    </div>
  );
};

export default Particulars;
