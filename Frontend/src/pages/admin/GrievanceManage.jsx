import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAllGrievances } from "../../api/grievance.api";
import ResolutionEvidence from "../../components/ResolutionEvidence";
import MapLink from "../../components/MapLink";
import MunicipalBadge from "../../components/MunicipalBadge";
import ResolveGrievanceModal from "../../components/ResolveGrievanceModal";
export default function GrievanceManage() {
  const { id } = useParams();
  const { t } = useTranslation(["admin", "citizen", "common"]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resolving, setResolving] = useState(false);
  useEffect(() => {
    let active = true;
    getAllGrievances()
      .then((r) => {
        if (active) setReport(r.data.data.find((g) => String(g.id) === id));
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);
  return (
    <section className="form-panel panel grievance-detail-panel">
      <Link className="back-link" to="/admin">
        ← {t("nav.grievanceDesk")}
      </Link>
      <h2>
        {t("grievanceManage.heading")} #{id}
      </h2>
      {loading ? (
        <div className="loading-state" role="status">
          {t("dashboard.loading")}
        </div>
      ) : !report ? (
        <p role="alert">
          {t(error ? "dashboard.loadError" : "dashboard.empty.title")}
        </p>
      ) : (
        <>
          <div className="grievance-detail-head">
            <h3>{report.title}</h3>
            <span className={`status ${report.status}`}>
              {t(`statuses.${report.status}`, { ns: "common" })}
            </span>
          </div>
          <p className="grievance-detail-description">{report.description}</p>
          <p>
            {t("dashboard.table.citizen")}:{" "}
            <strong>{report.citizen_name}</strong>
          </p>
          <div className="grievance-detail-meta">
            <MapLink source={report.location_source}
              lat={report.latitude}
              lng={report.longitude}
              address={report.location_address}
            />
            <MunicipalBadge
              body={report.municipal_body}
              district={report.municipal_district}
            />
          </div>
          <ResolutionEvidence report={report} />

          {report.status !== "resolved" && (
            <button
              className="primary-btn"
              style={{ marginTop: 24 }}
              onClick={() => setResolving(true)}
            >
              {t("resolveModal.heading")}
            </button>
          )}
          {resolving && (
            <ResolveGrievanceModal
              grievanceId={report.id}
              beforePhoto={report.photo}
              onClose={() => setResolving(false)}
              onResolved={(data) => {
                setReport({ ...report, ...data });
                setResolving(false);
              }}
            />
          )}
        </>
      )}
    </section>
  );
}
