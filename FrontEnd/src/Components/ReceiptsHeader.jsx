import { useContext, useEffect, useRef, useState } from "react";
import useUserInfo from "../CustomHooks/useUserInfo";
import { AppContext } from "./Context";
import axios from "axios";
import { REACT_SERVER_URL, CLOUDINARY_CLOUD_NAME } from "../../config/ENV";
import { TiTick } from "react-icons/ti";
import { RxCrossCircled } from "react-icons/rx";
import { FaFileUpload } from "react-icons/fa";
import { FaFileDownload } from "react-icons/fa";
import fetchParticulars from "../../Helpers/ParticularsApi";

const TableHeader = ({ isAdmin }) => {
  const inputRef = useRef(null);
  const {
    setSharedTableData,
    sharedTableData,
    setCleartable,
    reqmrno,
    mrno,
    setIsMRSelected,
    setSortVendors,
    setMrno,
    cleartable,
    setSelectedMr,
    particulars,
    setPdfurl,
    setParticularName,
    particularname,
    setParticulars,
    setNewMr,
    newMr,
  } = useContext(AppContext);
  const formData = sharedTableData?.formData;
  const userInfo = useUserInfo();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadParticulars = async () => {
      try {
        const particulars = await fetchParticulars();
        setParticulars(particulars.Particulars);
      } catch (error) {
        console.log(error);
      }
    };
    loadParticulars();
  }, []);

  useEffect(() => {
    if (userInfo?.isAdmin) {
      setEditing(true);
    }
  }, [userInfo]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setSharedTableData((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }));
  };

  const fetchReceipt = async (id) => {
    if (id && id != "default") {
      try {
        const config = {
          "Content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        };
        const response = await axios.get(
          `${REACT_SERVER_URL}/receipts/${id}`,
          config
        );
        const receipt = response.data;
        setSharedTableData({
          formData: receipt.formData || {},
          tableData: receipt.tableData || [],
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      setCleartable(true);
      setSharedTableData({
        formData: {},
        tableData: [],
      });
    }
  };

  let statusLogo = null;
  const status = sharedTableData.formData.status ?? null;
  var approverComments = sharedTableData.formData.approverComments;

  if (status === "approved") {
    statusLogo = (
      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-600 rounded-full w-fit">
        <TiTick className="text-green-600 text-2xl" />
        <span className="font-medium text-sm">Approved</span>
      </div>
    );
  } else if (status === "rejected") {
    statusLogo = (
      <div className="flex items-center gap-2 px-3 py-1 bg-red-100  text-red-600 rounded-full w-fit">
        <RxCrossCircled className="text-red-600 text-2xl" />
        <span className="font-medium text-sm">Rejected</span>
      </div>
    );
  } else {
    statusLogo = "";
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "Techno_computers");
        formData.append("resource_type", "raw");
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          const pdf_Url = data.secure_url;
          setPdfurl(pdf_Url);
          setSharedTableData((prev) => ({
            ...prev,
            formData: {
              ...prev.formData,
              file: pdf_Url,
            },
          }));
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  return (
    <div className="text-center mb-6 space-y-2">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setCleartable(true);
              setSharedTableData({
                formData: {
                  equipMrNoValue: "",
                  emRegNoValue: "",
                  hiringName: "",
                  locationValue: "",
                  projectValue: "",
                  requirementDurationValue: "",
                  file: "",
                  requiredDateValue: new Date(),
                  dateValue: new Date(),
                },
                tableData: [],
              });
              setMrno([]);
              setSortVendors(false);
              setNewMr(true);
              setParticularName([]);
            }}
            className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl shadow-md transition duration-200 cursor-pointer ${
              !userInfo?.isAdmin ? "hidden" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Statement
          </button>
          <div
            className={`flex items-center gap-2 ${!newMr ? "invisible" : ""}`}
          >
            {
              <div className="flex items-center gap-2">
                <label
                  htmlFor="templateSelect"
                  className="text-sm font-medium text-gray-700 ml-5"
                >
                  Choose Template:
                </label>{" "}
                <select
                  id="templateSelect"
                  value={particularname}
                  onChange={(e) => setParticularName(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Select Template</option>
                  {Array.isArray(particulars) &&
                    particulars?.map((template, index) => (
                      <option key={template._id} value={template.template}>
                        {template.template}
                      </option>
                    ))}
                </select>
              </div>
            }
          </div>
        </div>
        <div className="flex-1 flex justify-center mr-35">
          <h2 className="text-2xl font-medium uppercase text-center">
            GALFAR ENGINEERING & CONTRACTING WLL EMIRATES
          </h2>
        </div>

        <div className="w-[250px]" />
      </div>
      <div className="flex justify-between items-center w-full relative">
        <div className="w-1/3" />

        <h3 className="text-md font-medium text-center absolute left-1/2 transform -translate-x-1/2 italic">
          COMPARATIVE STATEMENT
        </h3>

        <div className="flex w-1/4 justify-between">
          {userInfo.isAdmin ? (
            <div className="flex items-center gap-2">
              <label
                htmlFor="receiptfile"
                className="flex items-center gap-2 text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-200 transition-all"
              >
                Upload File
                <FaFileUpload size={20} />
                <input
                  id="receiptfile"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          ) : (
            <>
              <div className="relative flex items-center gap-2">
                <a
                  href={sharedTableData.formData.file}
                  target="_blank"
                  download
                  className="flex items-center gap-2 text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-200 transition-all"
                >
                  Download Attachments
                  <FaFileDownload size={20} className="relative" />
                  {sharedTableData.formData.file && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg animate-bounce z-10">
                      1
                    </span>
                  )}
                </a>
              </div>
            </>
          )}
          <div className="w-full flex justify-end">
            <h4 className="text-sm font-normal flex items-center gap-5">
              Date:{" "}
              {isAdmin ? (
                <input
                  type="date"
                  value={
                    formData?.dateValue
                      ? new Date(formData.dateValue).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={handleChange("dateValue")}
                  className="w-full max-w-xs border border-gray-300 rounded-xl px-4 py-2 shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              ) : (
                <span>
                  <p>
                    {new Date(formData?.dateValue).getDate()}.
                    {new Date(formData?.dateValue).getMonth() + 1}.
                    {new Date(formData?.dateValue).getFullYear()}
                  </p>
                </span>
              )}
            </h4>
          </div>
        </div>
      </div>

      <div className="flex items-center w-full">
        <div className="flex items-center text-sm font-medium w-1/3">
          <div className="ml-4">
            <label htmlFor="mrNo" className="text-gray-700 mr-2">
              Choose MR No.
            </label>
            <select
              id="mrNo"
              className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={formData?.equipMrNoValue}
              onChange={(e) => {
                handleChange("equipMrNoValue")(e);
                if (e.target.value !== "default") {
                  fetchReceipt(e.target.value);
                  setIsMRSelected(true);
                  setSelectedMr(e.target.value);
                  setNewMr(false);
                } else {
                  setCleartable(true);
                  setSelectedMr(e.target.value);
                  setSharedTableData({ formData: {}, tableData: [] });
                }
              }}
            >
              <option value="default">Select an option</option>
              {(isAdmin ? mrno : reqmrno).map((value, index) => (
                <option key={index} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="relative group ml-3.5">
            {/* Icon */}
            {statusLogo}

            {/* Tooltip */}
            {approverComments && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-800 text-white text-xs px-3 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {approverComments}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center text-sm font-medium w-1/3">
          {isAdmin ? (
            <>
              <span className="mr-2">HIRING -</span>
              <input
                type="text"
                value={formData?.hiringName ?? ""}
                ref={inputRef}
                onChange={handleChange("hiringName")}
                className="border-b border-gray-500 outline-none text-sm font-medium text-center px-2 py-1"
              />
            </>
          ) : (
            <p className="text-sm font-medium">
              HIRING -{" "}
              <span className="font-medium">{formData?.hiringName ?? ""}</span>
            </p>
          )}
        </div>

        <div className="w-1/3" />
      </div>
      <div className="flex justify-between mt-4 px-4">
        <div className="flex flex-col space-y-1 text-left w-1/3">
          <p>
            <span className="font-medium">PROJECT:</span>{" "}
            {isAdmin ? (
              <input
                type="text"
                value={formData?.projectValue ?? ""}
                onChange={handleChange("projectValue")}
                className="border-b border-gray-400 outline-none px-1 text-sm"
              />
            ) : (
              formData?.projectValue
            )}
          </p>
          <p>
            <span className="font-medium">Location:</span>{" "}
            {isAdmin ? (
              <input
                type="text"
                value={formData?.locationValue ?? ""}
                onChange={handleChange("locationValue")}
                className="border-b border-gray-400 outline-none px-1 text-sm"
              />
            ) : (
              formData?.locationValue
            )}
          </p>
        </div>

        <div className="flex flex-col space-y-1 text-center w-1/3">
          <p>
            <span className="font-medium">EQUIP MR NO:</span>{" "}
            {isAdmin ? (
              <input
                type="text"
                value={formData?.equipMrNoValue ?? ""}
                onChange={handleChange("equipMrNoValue")}
                className="border-b border-gray-400 outline-none px-1 text-sm"
              />
            ) : (
              formData?.equipMrNoValue
            )}
          </p>
          <p>
            <span className="font-medium">EM REG NO:</span>{" "}
            {isAdmin ? (
              <input
                type="text"
                value={formData?.emRegNoValue ?? ""}
                onChange={handleChange("emRegNoValue")}
                className="border-b border-gray-400 outline-none px-1 text-sm"
              />
            ) : (
              formData?.emRegNoValue
            )}
          </p>
        </div>

        <div className="flex flex-col space-y-2 text-sm w-1/3">
          <div className="flex items-center justify-between">
            <label className="font-medium whitespace-nowrap mr-2 ml-50">
              REQUIRED DATE:
            </label>
            {isAdmin ? (
              <input
                type="date"
                value={
                  new Date(formData.requiredDateValue)
                    .toISOString()
                    .split("T")[0]
                }
                onChange={handleChange("requiredDateValue")}
                className="border-b border-gray-400 outline-none px-1 text-sm w-full max-w-[160px]"
              />
            ) : (
              <span>
                {formData.requiredDateValue
                  ? new Date(formData.requiredDateValue)
                      .toISOString()
                      .split("T")[0]
                  : ""}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="font-medium whitespace-nowrap mr-2 ml-50">
              REQUIREMENT DURATIONS:
            </label>
            {isAdmin ? (
              <input
                type="text"
                value={formData?.requirementDurationValue ?? ""}
                onChange={handleChange("requirementDurationValue")}
                className="border-b border-gray-400 outline-none px-1 text-sm w-full max-w-[160px]"
              />
            ) : (
              <span>{formData?.requirementDurationValue ?? ""}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableHeader;
