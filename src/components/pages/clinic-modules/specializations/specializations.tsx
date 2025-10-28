"use client";


import { useState } from "react";
import Modals from "./modals/modals";
import SearchInput from "@/core/common/dataTable/dataTableSearch";
import Datatable from "@/core/common/dataTable";
import { SpecializationsListData } from "@/core/json/specializationListData";
import ImageWithBasePath from "@/core/imageWithBasePath";
import { DatePicker } from "antd";
import { Specialization, StatusActive } from "@/core/common/selectOption";
import Link from "next/link";
import CommonSelect from "@/core/common/common-select/commonSelect";

const SpecializationsComponent = () => {
  const data = SpecializationsListData;
  const columns = [
    {
      title: "Specialization",
      dataIndex: "Specialization",
      render: (text: any, render: any) => (
        <div className="d-flex align-items-center">
          <Link
            href="#"
            className="avatar me-2"
            data-bs-toggle="modal"
            data-bs-target="#view_staff"
          >
            <ImageWithBasePath
              src={`assets/img/doctors/${render.img}`}
              alt="Doctor"
              className="rounded-circle"
            />
          </Link>
          <div>
            <h6 className="mb-0 fs-14 fw-semibold">
              <Link href="#" data-bs-toggle="modal" data-bs-target="#view_staff">
                {text}
              </Link>
            </h6>
          </div>
        </div>
      ),
      sorter: (a: any, b: any) =>
        a.Specialization.length - b.Specialization.length,
    },
    {
      title: "Created Date",
      dataIndex: "CreatedDate",
      sorter: (a: any, b: any) => a.CreatedDate.length - b.CreatedDate.length,
    },
    {
      title: "No of Doctor",
      dataIndex: "NoofDoctor",
      sorter: (a: any, b: any) => a.NoofDoctor.length - b.NoofDoctor.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge ${text === "Active"
            ? "badge-soft-success border-success"
            : "badge-soft-danger border-danger"
            }  border  px-2 py-1 fs-13 fw-medium`}
        >
          {text}
        </span>
      ),
      sorter: (a: any, b: any) => a.Status.length - b.Status.length,
    },
    {
      title: "",
      render: () => (
        <div className="action-item">
          <Link href="#" data-bs-toggle="dropdown">
            <i className="ti ti-dots-vertical" />
          </Link>
          <ul className="dropdown-menu p-2">
            <li>
              <Link
                href="#"
                className="dropdown-item d-flex align-items-center"
                data-bs-toggle="modal"
                data-bs-target="#edit_specialization"
              >
                Edit
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="dropdown-item d-flex align-items-center"
                data-bs-toggle="modal"
                data-bs-target="#delete_specialization"
              >
                Delete
              </Link>
            </li>
          </ul>
        </div>
      ),
    },
  ];
  const [searchText, setSearchText] = useState<string>("");

  const handleSearch = (value: string) => {
    setSearchText(value);
  };
  const getModalContainer = () => {
    const modalElement = document.getElementById("modal-datepicker");
    return modalElement ? modalElement : document.body; // Fallback to document.body if modalElement is null
  };
  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content">
          {/* Start Page Header */}
          <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
            <div className="flex-grow-1">
              <h4 className="fw-bold mb-0">
                Specializations
                <span className="badge badge-soft-primary border border-primary fs-13 fw-medium ms-2">
                  Total Specializations : 33
                </span>
              </h4>
            </div>
            <div className="text-end d-flex">
              <Link
                href="#"
                className="btn btn-primary text-white ms-2 fs-13 btn-md"
                data-bs-toggle="modal"
                data-bs-target="#add_specialization"
              >
                <i className="ti ti-plus me-1" />
                Add New Specialization
              </Link>
            </div>
          </div>
          {/* End Page Header */}
          <div className=" d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <div className="search-set mb-3">
              <div className="d-flex align-items-center flex-wrap gap-2">
                <div className="table-search d-flex align-items-center mb-0">
                  <div className="search-input">
                    <SearchInput value={searchText} onChange={handleSearch} />
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex table-dropdown mb-3 pb-1 right-content align-items-center flex-wrap row-gap-3">
              <div className="dropdown me-2">
                <Link
                  href="#"
                  className="btn btn-white fs-14 py-1 bg-white border d-inline-flex text-dark align-items-center"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                >
                  <i className="ti ti-filter text-gray-5 me-1" />
                  Filters
                </Link>
                <div
                  className="dropdown-menu dropdown-lg dropdown-menu-end filter-dropdown p-0"
                  id="filter-dropdown"
                >
                  <div className="d-flex align-items-center justify-content-between border-bottom filter-header">
                    <h5 className="mb-0 fw-bold">Filter</h5>
                    <div className="d-flex align-items-center">
                      <Link
                        href="#"
                        className="link-danger text-decoration-underline"
                      >
                        Clear All
                      </Link>
                    </div>
                  </div>
                  <form action="#">
                    <div className="filter-body pb-0">
                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <label className="form-label">Specialization</label>
                        </div>
                        <CommonSelect
                          options={Specialization}
                          className="select"
                          defaultValue={Specialization[0]}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label mb-1 text-dark fs-14 fw-medium">
                          Date
                        </label>
                        <div className="input-icon-end position-relative">
                          <DatePicker
                            className="form-control datetimepicker"
                            format={{
                              format: "DD-MM-YYYY",
                              type: "mask",
                            }}
                            getPopupContainer={getModalContainer}
                            placeholder="DD-MM-YYYY"
                            suffixIcon={null}
                          />
                          <span className="input-icon-addon">
                            <i className="ti ti-calendar" />
                          </span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <label className="form-label">Status</label>
                        </div>
                        <CommonSelect
                          options={StatusActive}
                          className="select"
                          defaultValue={StatusActive[0]}
                        />
                      </div>
                    </div>
                    <div className="filter-footer d-flex align-items-center justify-content-end border-top">
                      <a
                        href="#"
                        className="btn btn-light btn-md me-2"
                        id="close-filter"
                      >
                        Close
                      </a>
                      <button type="submit" className="btn btn-primary btn-md">
                        Filter
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="dropdown">
                <Link
                  href="#"
                  className="dropdown-toggle btn bg-white btn-md d-inline-flex align-items-center fw-normal rounded border text-dark px-2 py-1 fs-14"
                  data-bs-toggle="dropdown"
                >
                  <span className="me-1"> Sort By : </span> Recent
                </Link>
                <ul className="dropdown-menu  dropdown-menu-end p-2">
                  <li>
                    <Link href="#" className="dropdown-item rounded-1">
                      Recent
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="dropdown-item rounded-1">
                      Oldest
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="table-responsive">
            <Datatable
              columns={columns}
              dataSource={data}
              Selection={false}
              searchText={searchText}
            />
          </div>
        </div>
        {/* End Content */}
        {/* Footer Start */}
        <div className="footer text-center bg-white p-2 border-top">
          <p className="text-dark mb-0">
            2025 ©
            <Link href="#" className="link-primary">
              EMR
            </Link>
            , All Rights Reserved
          </p>
        </div>
        {/* Footer End */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
      <Modals />
    </>
  );
};

export default SpecializationsComponent;
