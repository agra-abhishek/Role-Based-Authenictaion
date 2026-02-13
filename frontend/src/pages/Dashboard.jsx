import { useEffect, useState } from "react";
import API from "../api/api";

function Dashboard() {
  const token = localStorage.getItem("token");

  if (!token) return <div className="p-10">Please login first.</div>;

  // Decode JWT safely
  let decoded;
  try {
    decoded = JSON.parse(atob(token.split(".")[1]));
  } catch (err) {
    return <div className="p-10">Invalid token</div>;
  }

  const { id, role } = decoded;

  const [profile, setProfile] = useState({});
  const [users, setUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // ================= FETCH PROFILE =================
  const fetchProfile = async () => {
    try {
      const res = await API.get(`/user/${id}`);

      const userData = res.data.data || res.data;

      setProfile(userData);
      setFormData({
        name: userData.name,
        email: userData.email,
        password: "",
      });
    } catch (err) {
      console.log("Profile error:", err.response?.data);
    }
  };

  // ================= FETCH ALL USERS (ADMIN) =================
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setErrorUsers("");

      const res = await API.get("/user");

      setUsers(res.data.data || res.data || []);
    } catch (err) {
      console.log("Users error:", err.response?.data);
      setErrorUsers("Access denied or failed to fetch users");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    if (role === "admin") {
      fetchUsers();
    }
  }, []);

  // ================= UPDATE PROFILE =================
  const handleUpdate = async () => {
    try {
      await API.put(`/user/${id}`, formData);
      setMessage("Profile updated successfully ✅");
      setFormData({ ...formData, password: "" });
      fetchProfile();
    } catch (err) {
      setMessage("Update failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ================= NAVBAR ================= */}
      <div className="bg-white shadow flex justify-between items-center px-8 py-4">

        <h1 className="text-xl font-bold">
          {role === "admin" ? "Admin Dashboard 👑" : "User Dashboard 👤"}
        </h1>

        {/* Profile Avatar */}
        <div className="relative">

          <div
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer font-bold"
          >
            {profile?.name?.charAt(0)?.toUpperCase()}
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-72 bg-white shadow-xl rounded-xl p-4 z-50">

              <h2 className="font-semibold mb-3 text-gray-700 text-sm">
                Update Profile
              </h2>

              {message && (
                <p className="text-green-600 text-xs mb-2">{message}</p>
              )}

              <input
                type="text"
                className="border p-2 rounded w-full mb-2 text-sm"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <input
                type="email"
                className="border p-2 rounded w-full mb-2 text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <input
                type="password"
                className="border p-2 rounded w-full mb-3 text-sm"
                placeholder="New Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />

              <button
                onClick={handleUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded text-sm transition"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="p-8">

        {/* ================= ADMIN USER LIST ================= */}
        {role === "admin" && (
          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-lg font-semibold mb-4">
              All Registered Users
            </h2>

            {loadingUsers && <p>Loading users...</p>}

            {errorUsers && (
              <p className="text-red-500">{errorUsers}</p>
            )}

            {!loadingUsers && users.length > 0 && (
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="p-2 border">{user.name}</td>
                      <td className="p-2 border">{user.email}</td>
                      <td className="p-2 border">{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loadingUsers && users.length === 0 && (
              <p>No users found.</p>
            )}
          </div>
        )}

        {/* ================= USER WELCOME ================= */}
        {role === "user" && (
          <div className="text-center mt-20 text-gray-600">
            Welcome back, <span className="font-semibold">{profile?.name}</span> 👋
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
