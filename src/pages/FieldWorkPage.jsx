import React from "react";
import { useUserInfo } from "../hooks/useUserInfo";
import { useLogs } from "../hooks/useLogs";
import LogsTable from "../components/FWnormal";
import MultiPlaceForm from "../components/FWmultiplace";
import ActionButtons from "../components/FWActionButtons";
import Layout from "../components/Layout";

const FieldWorkPage = () => {
  const userInfo = useUserInfo();
  const {
    logs,
    transport,
    multiPlaceData,
    handleRecord,
    handleMultiplePlacesRecord,
    handleApplyTransport,
    handleSaveExpenses,
    handleSaveMultiPlace,
    setTransport,
    setMultiPlaceData,
    isRecording,        // <-- new from hook
    isMultiRecording,   // <-- new from hook
  } = useLogs(userInfo);

  if (!userInfo)
    return (
      <div className="flex items-center justify-center h-screen text-gray-700">
        Loading user info...
      </div>
    );

  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <Layout title="FIELD WORK" backTo="/mode-selector">
      {/* Main Content */}
      <div className="space-y-8">
        {/* User Info Section */}
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-gray-100 p-4 rounded-lg shadow text-center">
            <p className="text-sm font-medium text-gray-500">Username</p>
            <p className="text-lg font-bold">{userInfo.username}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg shadow text-center">
            <p className="text-sm font-medium text-gray-500">HQ</p>
            <p className="text-lg font-bold">{userInfo.hq?.toUpperCase()}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg shadow text-center">
            <p className="text-sm font-medium text-gray-500">Month</p>
            <p className="text-lg font-bold">{currentMonth}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <ActionButtons
            userInfo={userInfo}
            transport={transport}
            setTransport={setTransport}
            handleRecord={handleRecord}
            handleApplyTransport={handleApplyTransport}
            handleMultiplePlacesRecord={handleMultiplePlacesRecord}
            currentCity={logs[0]?.location || ""}
            isRecording={isRecording}               // passed to buttons
            isMultiRecording={isMultiRecording}     // passed to buttons
          />
        </div>

        {/* Logs Table */}
        <div className="max-w-6xl mx-auto">
          <LogsTable logs={logs} onSave={handleSaveExpenses} />
        </div>

        {/* Multi-Place Form */}
        {multiPlaceData && (
          <div className="max-w-6xl mx-auto">
            <MultiPlaceForm
              data={multiPlaceData}
              setData={setMultiPlaceData}
              onSave={handleSaveMultiPlace}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FieldWorkPage;
