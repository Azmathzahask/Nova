import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";

// Simple inline Progress bar
const Progress = ({ value }) => (
  <div className="w-full bg-gray-200 rounded-full h-3">
    <div
      className="bg-green-500 h-3 rounded-full"
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
);

const NovaHealthDashboard = () => {
  const [activeTab, setActiveTab] = useState("agent");
  const [chatMessages, setChatMessages] = useState([
    { from: "agent", text: "Hi Alex 👋 How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");

  const [medications, setMedications] = useState([
    { name: "Lisinopril (10mg)", taken: true, time: "08:00" },
    { name: "Metformin (500mg)", taken: true, time: "12:00" },
    { name: "Atorvastatin (20mg)", taken: false, time: "20:00" },
  ]);
  const [newMed, setNewMed] = useState("");

  const [mealPhoto, setMealPhoto] = useState(null);
  const [steps, setSteps] = useState(3842);

  const height = 170;
  const weight = 70;
  const bmi = (weight / ((height / 100) ** 2)).toFixed(1);

  const getNextMedication = () => {
    return medications.find(med => !med.taken);
  };
  
  const upcomingMed = getNextMedication();

  const handleSend = async () => {
    if (!input.trim()) return;
    setChatMessages((prev) => [...prev, { from: "user", text: input }]);
    const userMessage = input;
    setInput("");

    try {
      // 🆕 NEW: Using the environment variable for the API URL
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const apiUrl = `${backendUrl}/chat`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userId: "azmath",
          healthData: {
            steps: steps,
            bmi: bmi,
            medications: medications,
            medicationReminder: upcomingMed 
              ? `Next medication due soon: ${upcomingMed.name}${upcomingMed.time ? ' at ' + upcomingMed.time : ''}.`
              : 'All medications have been taken for the day.',
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setChatMessages((prev) => [
          ...prev,
          { from: "agent", text: data.reply },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { from: "agent", text: `Server error: ${data.reply || response.statusText}` },
        ]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setChatMessages((prev) => [
        ...prev,
        { from: "agent", text: `Error: ${error.message}` },
      ]);
    }
  };

  const handleAddMedication = () => {
    if (!newMed.trim()) return;
    setMedications([...medications, { name: newMed.trim(), taken: false }]);
    setNewMed("");
  };

  const handleDeleteMedication = (index) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleTaken = (index) => {
    setMedications((prev) =>
      prev.map((m, i) => (i === index ? { ...m, taken: !m.taken } : m))
    );
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMealPhoto(URL.createObjectURL(file));
    }
  };

  const userData = { name: "Alex Johnson", wellnessScore: 78, email: "alex@example.com" };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">N.O.V.A+</h1>
        <nav className="flex space-x-3">
          {[
            { key: "agent", label: "Agent" },
            { key: "nutrition", label: "Nutrition" },
            { key: "records", label: "Medications & Fitness" },
            { key: "profile", label: "Profile" },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant="ghost"
              onClick={() => setActiveTab(tab.key)}
              className={`capitalize transition-all px-4 py-2 rounded-lg ${
                activeTab === tab.key
                  ? "bg-white text-blue-700 font-semibold"
                  : "text-white hover:bg-blue-600"
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </nav>
      </header>
      <main className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-white space-y-6">
        {activeTab === "agent" && (
          <Card className="shadow-lg border border-gray-200 hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="text-blue-700">Agent</CardTitle>
              <CardDescription>Your AI companion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 overflow-y-auto border rounded-lg p-3 mb-3 bg-blue-50">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-2 p-2 rounded-lg max-w-xs ${
                      msg.from === "agent"
                        ? "bg-blue-200 text-blue-900 self-start"
                        : "bg-green-200 text-green-900 self-end text-right"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-300 transition"
                />
                <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleSend}>
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {activeTab === "nutrition" && (
          <Card className="shadow-lg border border-gray-200 hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="text-orange-600">Nutrition Analysis</CardTitle>
              <CardDescription>Capture/upload a meal photo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-dashed border-2 border-orange-300 rounded-lg p-6 text-center bg-orange-50">
                <p className="text-orange-500 mb-4">🍽️ Capture or upload your food photo</p>
                <input
                  id="mealUpload"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label htmlFor="mealUpload" className="cursor-pointer px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                  Capture / Upload Photo
                </label>
              </div>
              {mealPhoto && (
                <div className="mt-4 flex items-start space-x-4">
                  <img src={mealPhoto} alt="Meal preview" className="w-40 h-40 object-cover rounded-lg shadow-md" />
                  <div>
                    <h4 className="font-semibold text-lg">Preview</h4>
                    <p className="text-sm text-gray-600 mt-1">This image will be sent to the nutrition analyzer.</p>
                  </div>
                </div>
              )}
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold text-orange-600">Today’s Nutrition Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Calories", value: "1,250 kcal", color: "bg-red-100 text-red-800" },
                    { label: "Protein", value: "60 g", color: "bg-green-100 text-green-800" },
                    { label: "Sugar", value: "30 g", color: "bg-yellow-100 text-yellow-800" },
                    { label: "Fiber", value: "15 g", color: "bg-purple-100 text-purple-800" },
                  ].map((item) => (
                    <div key={item.label} className={`p-4 rounded-lg flex flex-col items-center justify-center ${item.color}`}>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-2xl font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {activeTab === "records" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-purple-700">Medications</CardTitle>
                    <CardDescription>Reminders & records</CardDescription>
                  </div>
                  {upcomingMed ? (
                    <div className="mt-3 bg-yellow-100 border-l-4 border-yellow-300 text-yellow-800 px-4 py-2 rounded">
                      <strong>⏰ Next dose:</strong>{" "}
                      <span className="font-semibold">{upcomingMed.name}</span>
                      {upcomingMed.time ? ` at ${upcomingMed.time}` : " — soon"}
                    </div>
                  ) : (
                    <div className="mt-3 bg-green-50 text-green-700 px-4 py-2 rounded">
                      All medications taken ✅
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {medications.map((med, i) => (
                    <li key={i} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleToggleTaken(i)}
                          aria-label={med.taken ? "Mark as not taken" : "Mark as taken"}
                          className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                            med.taken ? "bg-green-500 text-white border-green-500" : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          {med.taken ? "✓" : "○"}
                        </button>
                        <div>
                          <div className={`${med.taken ? "line-through text-gray-500" : "text-gray-800"} font-medium`}>
                            {med.name}
                          </div>
                          {med.time && <div className="text-xs text-gray-400">{med.time}</div>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteMedication(i)}>
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex space-x-2">
                  <input
                    type="text"
                    value={newMed}
                    onChange={(e) => setNewMed(e.target.value)}
                    placeholder="New medication (e.g. 'Aspirin 75mg')"
                    className="flex-1 border rounded-lg p-2"
                  />
                  <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={handleAddMedication}>
                    ➕ Add
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="text-green-700">Fitness</CardTitle>
                <CardDescription>Daily activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="mb-2 font-semibold">Daily Steps</p>
                  <Progress value={(steps / 10000) * 100} />
                  <p className="text-sm mt-2">{steps} / 10,000 steps</p>
                </div>
                <div className="mb-4">
                  <p className="mb-2 font-semibold">BMI</p>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <p className="text-xl font-bold">{bmi}</p>
                    <p className="text-sm">
                      {bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese"}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Quick actions</h4>
                  <div className="flex space-x-2">
                    <Button onClick={() => setSteps((s) => Math.min(10000, s + 500))}>+500 steps</Button>
                    <Button variant="outline" onClick={() => setSteps(0)}>Reset</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === "profile" && (
          <Card className="shadow-lg border border-gray-200 hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="text-teal-700">Profile & Settings</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="font-semibold text-teal-600">User Info</h3>
                <p>Name: {userData.name}</p>
                <p>Email: {userData.email}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-teal-600">Preferences</h3>
                {[
                  "Medication Reminders",
                  "Fitness Nudges",
                  "Nutrition Suggestions",
                  "Emotional Check-ins",
                ].map((pref) => (
                  <label key={pref} className="flex items-center space-x-2 mb-2">
                    <input type="checkbox" defaultChecked className="accent-teal-500" />
                    <span>{pref}</span>
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <span className="font-medium text-gray-700">Theme</span>
                <div className="flex space-x-2">
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                    onClick={() => document.documentElement.classList.remove("dark")}
                  >
                    ☀ Light
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
                    onClick={() => document.documentElement.classList.add("dark")}
                  >
                    🌙 Dark
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default NovaHealthDashboard;
