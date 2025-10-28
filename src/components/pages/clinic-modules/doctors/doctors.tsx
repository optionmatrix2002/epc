"use client";

import { DatePicker } from "antd";
import {
  Amount,
  Department,
  Designation,
  Doctor,
  Status,
} from "@/core/common/selectOption";
import ImageWithBasePath from "@/core/imageWithBasePath";
import Modals from "./modals/modals";
import { all_routes } from "../../../../routes/all_routes";
import Link from "next/link";
import CommonSelect from "@/core/common/common-select/commonSelect";

const DoctorsComponent = () => {
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
          <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3">
            <div className="flex-grow-1">
              <h4 className="fw-bold mb-0">
                Physician Grid
                <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                  Total Physicians : 565
                </span>
              </h4>
            </div>
            <div className="text-end d-flex">
              <div className="dropdown me-2">
                <Link
                  href="#"
                  className="btn btn-white bg-white fs-14 py-1 border d-inline-flex text-dark align-items-center"
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
                    <h4 className="mb-0">Filter</h4>
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
                          <label className="form-label">Doctor</label>
                          <Link href="#" className="link-primary mb-1">
                            Reset
                          </Link>
                        </div>
                        <CommonSelect
                          options={Doctor}
                          className="select"
                          defaultValue={Doctor[0]}
                        />
                      </div>
                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <label className="form-label">Designation</label>
                          <Link href="#" className="link-primary mb-1">
                            Reset
                          </Link>
                        </div>
                        <CommonSelect
                          options={Designation}
                          className="select"
                          defaultValue={Designation[0]}
                        />
                      </div>
                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <label className="form-label">Department</label>
                          <Link href="#" className="link-primary mb-1">
                            Reset
                          </Link>
                        </div>
                        <CommonSelect
                          options={Department}
                          className="select"
                          defaultValue={Department[0]}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label mb-1 text-dark fs-14 fw-medium">
                          Date<span className="text-danger">*</span>
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
                          <label className="form-label">Amount</label>
                          <Link href="#" className="link-primary mb-1">
                            Reset
                          </Link>
                        </div>
                        <CommonSelect
                          options={Amount}
                          className="select"
                          defaultValue={Amount[0]}
                        />
                      </div>
                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <label className="form-label">Status</label>
                          <Link href="#" className="link-primary mb-1">
                            Reset
                          </Link>
                        </div>
                        <CommonSelect
                          options={Status}
                          className="select"
                          defaultValue={Status[0]}
                        />
                      </div>
                    </div>
                    <div className="filter-footer d-flex align-items-center justify-content-end border-top">
                      <Link
                        href="#"
                        className="btn btn-light btn-md me-2"
                        id="close-filter"
                      >
                        Close
                      </Link>
                      <button type="submit" className="btn btn-primary btn-md">
                        Filter
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="bg-white border shadow-sm rounded px-1 pb-0 text-center d-flex align-items-center justify-content-center">
                <Link
                  href={all_routes.doctorsList}
                  className="bg-white rounded p-1 d-flex align-items-center justify-content-center"
                >
                  <i className="ti ti-list fs-14 text-body" />
                </Link>
                <Link
                  href={all_routes.doctors}
                  className="bg-light rounded p-1 d-flex align-items-center justify-content-center"
                >
                  <i className="ti ti-layout-grid fs-14 text-body" />
                </Link>
              </div>
              <Link
                href={all_routes.addDoctors}
                className="btn btn-primary ms-2 fs-13 btn-md"
              >
                <i className="ti ti-plus me-1" />
                New Doctor
              </Link>
            </div>
          </div>
          {/* End Page Header */}
          <div className="row">
            {/* The first doctor card - structured to match the image */}
            <div className="col-xl-4 col-md-6">
              <div className="card">
                <div className="card-body text-center p-4 position-relative">
                  {/* Dropdown Menu (now correctly positioned with CSS) */}
                  {/* Dropdown positioned at top-right of the card */}
                  <div className="dropdown doctor-card-dropdown" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <button
                      className="btn p-0 border-0 text-muted"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      aria-label="Card options"
                    >
                      <i className="ti ti-dots-vertical fs-4" />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <Link className="dropdown-item" href={all_routes.editDoctors}>
                          Edit
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" href="#">
                          Delete
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Doctor Image */}
                  <ImageWithBasePath
                    src="assets/img/doctors/doctor-01.jpg"
                    className="rounded-circle mx-auto"
                    alt="Dr. Mick Thompson"
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover' }}
                  />

                  {/* Doctor Info */}
                  <h5 className="mt-3 mb-1 fw-bold">Dr. Mick Thompson</h5>
                  <p className="text-muted mb-2">Cardiologist</p>
                  <p className="mb-2">Available : Mon, 20 Jan 2025</p>
                  <p className="mb-3">Starts From : <span className="fw-bold">$499</span></p>

                  {/* Buttons (now with equal height) */}
                  <div className="d-flex align-items-center gap-2">
                    <Link href="/doctor-details" className="btn btn-primary w-100" style={{ height: '36px' }}>
                      More
                    </Link>
                    <Link href="/application/chat" className="btn btn-white border-primary-light d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <i className="ti ti-message-circle-2 fs-4 text-primary" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Repeat the structure for all other cards */}

            <div className="col-xl-4 col-md-6">
              <div className="card">
                <div className="card-body text-center p-4 position-relative">
                  <div className="dropdown doctor-card-dropdown" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <button
                      className="btn p-0 border-0 text-muted"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      aria-label="Card options"
                    >
                      <i className="ti ti-dots-vertical fs-4" />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <Link className="dropdown-item" href={all_routes.editDoctors}>
                          Edit
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" href="#">
                          Delete
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <ImageWithBasePath
                    src="assets/img/doctors/doctor-02.jpg"
                    className="rounded-circle mx-auto"
                    alt="Dr. Sarah Johnson"
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover' }}
                  />
                  <h5 className="mt-3 mb-1 fw-bold">Dr. Sarah Johnson</h5>
                  <p className="text-muted mb-2">Orthopedic Surgeon</p>
                  <p className="mb-2">Available : Wed, 22 Jan 2025</p>
                  <p className="mb-3">Starts From : <span className="fw-bold">$450</span></p>
                  <div className="d-flex align-items-center gap-2">
                    <Link href="/doctor-details" className="btn btn-primary w-100" style={{ height: '36px' }}>
                      More
                    </Link>
                    <Link href="/application/chat" className="btn btn-white border-primary-light d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <i className="ti ti-message-circle-2 fs-4 text-primary" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6">
              <div className="card">
                <div className="card-body text-center p-4 position-relative">
                  <div className="dropdown doctor-card-dropdown" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <button
                      className="btn p-0 border-0 text-muted"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      aria-label="Card options"
                    >
                      <i className="ti ti-dots-vertical fs-4" />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <Link className="dropdown-item" href={all_routes.editDoctors}>
                          Edit
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" href="#">
                          Delete
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <ImageWithBasePath
                    src="assets/img/doctors/doctor-03.jpg"
                    className="rounded-circle mx-auto"
                    alt="Dr. Emily Carter"
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover' }}
                  />
                  <h5 className="mt-3 mb-1 fw-bold">Dr. Emily Carter</h5>
                  <p className="text-muted mb-2">Pediatrician</p>
                  <p className="mb-2">Available : Fri, 24 Jan 2025</p>
                  <p className="mb-3">Starts From : <span className="fw-bold">$300</span></p>
                  <div className="d-flex align-items-center gap-2">
                    <Link href="/doctor-details" className="btn btn-primary w-100" style={{ height: '36px' }}>
                      More
                    </Link>
                    <Link href="/application/chat" className="btn btn-white border-primary-light d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <i className="ti ti-message-circle-2 fs-4 text-primary" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional doctor cards (4 - 9) */}
            <div className="col-xl-4 col-md-6">
              <div className="card">
                <div className="card-body text-center p-4 position-relative">
                  <div className="dropdown doctor-card-dropdown" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <button className="btn p-0 border-0 text-muted" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Card options">
                      <i className="ti ti-dots-vertical fs-4" />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><Link className="dropdown-item" href={all_routes.editDoctors}>Edit</Link></li>
                      <li><Link className="dropdown-item" href="#">Delete</Link></li>
                    </ul>
                  </div>
                  <ImageWithBasePath src="assets/img/doctors/doctor-04.jpg" className="rounded-circle mx-auto" alt="Dr. Michael Brown" width={100} height={100} style={{ objectFit: 'cover' }} />
                  <h5 className="mt-3 mb-1 fw-bold">Dr. Michael Brown</h5>
                  <p className="text-muted mb-2">General Surgeon</p>
                  <p className="mb-2">Available : Mon, 27 Jan 2025</p>
                  <p className="mb-3">Starts From : <span className="fw-bold">$420</span></p>
                  <div className="d-flex align-items-center gap-2">
                    <Link href="/doctor-details" className="btn btn-primary w-100" style={{ height: '36px' }}>More</Link>
                    <Link href="/application/chat" className="btn btn-white border-primary-light d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}><i className="ti ti-message-circle-2 fs-4 text-primary" /></Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6">
              <div className="card">
                <div className="card-body text-center p-4 position-relative">
                  <div className="dropdown doctor-card-dropdown" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <button className="btn p-0 border-0 text-muted" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Card options">
                      <i className="ti ti-dots-vertical fs-4" />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><Link className="dropdown-item" href={all_routes.editDoctors}>Edit</Link></li>
                      <li><Link className="dropdown-item" href="#">Delete</Link></li>
                    </ul>
                  </div>
                  <ImageWithBasePath src="assets/img/doctors/doctor-05.jpg" className="rounded-circle mx-auto" alt="Dr. Olivia Wilson" width={100} height={100} style={{ objectFit: 'cover' }} />
                  <h5 className="mt-3 mb-1 fw-bold">Dr. Olivia Wilson</h5>
                  <p className="text-muted mb-2">Dermatologist</p>
                  <p className="mb-2">Available : Tue, 28 Jan 2025</p>
                  <p className="mb-3">Starts From : <span className="fw-bold">$350</span></p>
                  <div className="d-flex align-items-center gap-2">
                    <Link href="/doctor-details" className="btn btn-primary w-100" style={{ height: '36px' }}>More</Link>
                    <Link href="/application/chat" className="btn btn-white border-primary-light d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}><i className="ti ti-message-circle-2 fs-4 text-primary" /></Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6">
              <div className="card">
                <div className="card-body text-center p-4 position-relative">
                  <div className="dropdown doctor-card-dropdown" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <button className="btn p-0 border-0 text-muted" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Card options">
                      <i className="ti ti-dots-vertical fs-4" />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><Link className="dropdown-item" href={all_routes.editDoctors}>Edit</Link></li>
                      <li><Link className="dropdown-item" href="#">Delete</Link></li>
                    </ul>
                  </div>
                  <ImageWithBasePath src="assets/img/doctors/doctor-06.jpg" className="rounded-circle mx-auto" alt="Dr. David Lee" width={100} height={100} style={{ objectFit: 'cover' }} />
                  <h5 className="mt-3 mb-1 fw-bold">Dr. David Lee</h5>
                  <p className="text-muted mb-2">Neurologist</p>
                  <p className="mb-2">Available : Wed, 29 Jan 2025</p>
                  <p className="mb-3">Starts From : <span className="fw-bold">$480</span></p>
                  <div className="d-flex align-items-center gap-2">
                    <Link href="/doctor-details" className="btn btn-primary w-100" style={{ height: '36px' }}>More</Link>
                    <Link href="/application/chat" className="btn btn-white border-primary-light d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}><i className="ti ti-message-circle-2 fs-4 text-primary" /></Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6">
              <div className="card">
                <div className="card-body text-center p-4 position-relative">
                  <div className="dropdown doctor-card-dropdown" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <button className="btn p-0 border-0 text-muted" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Card options">
                      <i className="ti ti-dots-vertical fs-4" />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><Link className="dropdown-item" href={all_routes.editDoctors}>Edit</Link></li>
                      <li><Link className="dropdown-item" href="#">Delete</Link></li>
                    </ul>
                  </div>
                  <ImageWithBasePath src="assets/img/doctors/doctor-07.jpg" className="rounded-circle mx-auto" alt="Dr. Linda Martinez" width={100} height={100} style={{ objectFit: 'cover' }} />
                  <h5 className="mt-3 mb-1 fw-bold">Dr. Linda Martinez</h5>
                  <p className="text-muted mb-2">Endocrinologist</p>
                  <p className="mb-2">Available : Thu, 30 Jan 2025</p>
                  <p className="mb-3">Starts From : <span className="fw-bold">$375</span></p>
                  <div className="d-flex align-items-center gap-2">
                    <Link href="/doctor-details" className="btn btn-primary w-100" style={{ height: '36px' }}>More</Link>
                    <Link href="/application/chat" className="btn btn-white border-primary-light d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}><i className="ti ti-message-circle-2 fs-4 text-primary" /></Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6">
              <div className="card">
                <div className="card-body text-center p-4 position-relative">
                  <div className="dropdown doctor-card-dropdown" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <button className="btn p-0 border-0 text-muted" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Card options">
                      <i className="ti ti-dots-vertical fs-4" />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><Link className="dropdown-item" href={all_routes.editDoctors}>Edit</Link></li>
                      <li><Link className="dropdown-item" href="#">Delete</Link></li>
                    </ul>
                  </div>
                  <ImageWithBasePath src="assets/img/doctors/doctor-08.jpg" className="rounded-circle mx-auto" alt="Dr. James Anderson" width={100} height={100} style={{ objectFit: 'cover' }} />
                  <h5 className="mt-3 mb-1 fw-bold">Dr. James Anderson</h5>
                  <p className="text-muted mb-2">Cardiologist</p>
                  <p className="mb-2">Available : Fri, 31 Jan 2025</p>
                  <p className="mb-3">Starts From : <span className="fw-bold">$499</span></p>
                  <div className="d-flex align-items-center gap-2">
                    <Link href="/doctor-details" className="btn btn-primary w-100" style={{ height: '36px' }}>More</Link>
                    <Link href="/application/chat" className="btn btn-white border-primary-light d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}><i className="ti ti-message-circle-2 fs-4 text-primary" /></Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6">
              <div className="card">
                <div className="card-body text-center p-4 position-relative">
                  <div className="dropdown doctor-card-dropdown" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <button className="btn p-0 border-0 text-muted" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Card options">
                      <i className="ti ti-dots-vertical fs-4" />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><Link className="dropdown-item" href={all_routes.editDoctors}>Edit</Link></li>
                      <li><Link className="dropdown-item" href="#">Delete</Link></li>
                    </ul>
                  </div>
                  <ImageWithBasePath src="assets/img/doctors/doctor-09.jpg" className="rounded-circle mx-auto" alt="Dr. Sophia Clark" width={100} height={100} style={{ objectFit: 'cover' }} />
                  <h5 className="mt-3 mb-1 fw-bold">Dr. Sophia Clark</h5>
                  <p className="text-muted mb-2">Ophthalmologist</p>
                  <p className="mb-2">Available : Sat, 01 Feb 2025</p>
                  <p className="mb-3">Starts From : <span className="fw-bold">$360</span></p>
                  <div className="d-flex align-items-center gap-2">
                    <Link href="/doctor-details" className="btn btn-primary w-100">More</Link>
                    <Link href="/application/chat" className="btn btn-white border-primary-light d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}><i className="ti ti-message-circle-2 fs-4 text-primary" /></Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div className="text-center">
            <Link href="#" className="btn btn-white bg-white text-dark fs-13">
              Load More
              <span className="spinner-border spinner-border-sm ms-1" />
            </Link>
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

export default DoctorsComponent;