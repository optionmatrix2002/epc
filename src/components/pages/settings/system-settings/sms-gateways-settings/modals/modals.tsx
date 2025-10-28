
"use client";

import ImageWithBasePath from "@/core/imageWithBasePath";
import Link from "next/link";

const Modals = () => {
  return (
    <>
  {/* Start Add Mail */}
  <div id="add_nexmo" className="modal fade">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="text-dark modal-title fw-bold">Nexmo</h5>
          <button
            type="button"
            className="btn-close btn-close-modal custom-btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <i className="ti ti-x" />
          </button>
        </div>
        <form>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">
                API Key<span className="text-danger ms-1">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">
                API Secret Key<span className="text-danger ms-1">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
            <div className="mb-0">
              <label className="form-label">
                Sender ID<span className="text-danger ms-1">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
          </div>
          <div className="modal-footer d-flex align-items-center gap-1">
            <button
              type="button"
              className="btn btn-white border"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* End Add Mail */}
  {/* Start Add Mail */}
  <div id="php_smtp" className="modal fade">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="text-dark modal-title fw-bold">SMTP</h5>
          <button
            type="button"
            className="btn-close btn-close-modal custom-btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <i className="ti ti-x" />
          </button>
        </div>
        <form>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">
                From Email Address<span className="text-danger ms-1">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Email Password<span className="text-danger ms-1">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Email Host<span className="text-danger ms-1">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
            <div className="mb-0">
              <label className="form-label">
                Port<span className="text-danger ms-1">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
          </div>
          <div className="modal-footer d-flex align-items-center gap-1">
            <button
              type="button"
              className="btn btn-white border"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* End Add Mail */}
  {/* Start Add Mail */}
  <div id="test_mail" className="modal fade">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="text-dark modal-title fw-bold">Test Mail</h5>
          <button
            type="button"
            className="btn-close btn-close-modal custom-btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <i className="ti ti-x" />
          </button>
        </div>
        <form>
          <div className="modal-body">
            <div className="mb-0">
              <label className="form-label">
                Email Address<span className="text-danger ms-1">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
          </div>
          <div className="modal-footer d-flex align-items-center gap-1">
            <button
              type="button"
              className="btn btn-white border"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* End Add Mail */}
  {/* Start Delete Modal  */}
  <div className="modal fade" id="delete_modal">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-body text-center position-relative">
              <ImageWithBasePath
                src="assets/img/bg/delete-modal-bg-01.png"
                alt=""
                className="img-fluid position-absolute top-0 start-0"
              />
              <ImageWithBasePath
                src="assets/img/bg/delete-modal-bg-02.png"
                alt=""
                className="img-fluid position-absolute bottom-0 end-0"
              />
              <div className="mb-3">
                <span className="avatar avatar-lg bg-danger text-white">
                  <i className="ti ti-trash fs-24" />
                </span>
              </div>
              <h5 className="fw-bold mb-1">Delete Confirmation</h5>
              <p className="mb-3">Are you sure want to delete?</p>
              <div className="d-flex justify-content-center">
                <Link
                  href="#"
                  className="btn btn-light position-relative z-1 me-3"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <Link
                  href="#"
                  className="btn btn-danger position-relative z-1"
                >
                  Yes, Delete
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Delete Modal  */}
</>

  )
}

export default Modals