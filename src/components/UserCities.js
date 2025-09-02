

export default function UserCities({ user, onDelete }) {
  return (
    <div className="mb-6">
      {/* HQ City */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg text-gray-700 mb-2">HQ City</h3>
        <div className="bg-white shadow rounded-lg p-3 flex justify-between items-center">
          {user.hq ? (
            <>
              <span className="font-medium text-gray-800">{user.hq}</span>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                onClick={() => onDelete(user.hq, "hq")}
              >
                Delete
              </button>
            </>
          ) : (
            <span className="text-gray-400 italic">No HQ set</span>
          )}
        </div>
      </div>

      {/* EX Cities */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg text-gray-700 mb-2">EX Cities</h3>
        <div className="space-y-2">
          {user.ex?.length > 0 ? (
            user.ex.map((city, i) => (
              <div
                key={i}
                className="bg-white shadow rounded-lg p-3 flex justify-between items-center"
              >
                <span className="text-gray-800">{city}</span>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                  onClick={() => onDelete(city, "ex")}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <div className="text-gray-400 italic">No EX cities</div>
          )}
        </div>
      </div>

      {/* OS Cities */}
      <div>
        <h3 className="font-semibold text-lg text-gray-700 mb-2">OS Cities</h3>
        <div className="space-y-2">
          {user.os?.length > 0 ? (
            user.os.map((city, i) => (
              <div
                key={i}
                className="bg-white shadow rounded-lg p-3 flex justify-between items-center"
              >
                <span className="text-gray-800">{city}</span>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                  onClick={() => onDelete(city, "os")}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <div className="text-gray-400 italic">No OS cities</div>
          )}
        </div>
      </div>
    </div>
  );
}
