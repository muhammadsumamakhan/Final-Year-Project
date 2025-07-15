import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ExpertTest = () => {
  const navigate = useNavigate();

  // Simulated expert profile (replace with actual DB fetch)
  const [expert, setExpert] = useState({
    name: "Sumama",
    skill: "Hardware Repair", // or "Software Troubleshooting"
  });

  const [status, setStatus] = useState("not_applied"); // 'not_applied' | 'pending' | 'approved' | 'rejected'
  const [showQuestions, setShowQuestions] = useState(false);

  const hardware = [{
      id: 1,
      question: "Which programming paradigm does React primarily follow?",
      options: [
        "Object-Oriented Programming",
        "Functional Programming",
        "Procedural Programming",
        "Logic Programming"
      ],
      correctAnswer: "Functional Programming"
    },
    {
      id: 2,
      question: "What is the purpose of the virtual DOM in React?",
      options: [
        "To improve security",
        "To optimize rendering performance",
        "To enable server-side rendering",
        "To manage state"
      ],
      correctAnswer: "To optimize rendering performance"
    },
    {
      id: 3,
      question: "Which hook would you use to perform side effects in a functional component?",
      options: [
        "useState",
        "useEffect",
        "useContext",
        "useReducer"
      ],
      correctAnswer: "useEffect"
    },
    {
      id: 4,
      question: "What is JSX in React?",
      options: [
        "A JavaScript extension syntax",
        "A templating language",
        "A state management library",
        "A build tool"
      ],
      correctAnswer: "A JavaScript extension syntax"
    },
    {
      id: 5,
      question: "Which method is called when a component is being removed from the DOM?",
      options: [
        "componentWillUnmount",
        "componentDidMount",
        "componentWillUpdate",
        "shouldComponentUpdate"
      ],
      correctAnswer: "componentWillUnmount"
    },
    {
      id: 6,
      question: "What is the purpose of React Router?",
      options: [
        "To manage component state",
        "To handle client-side routing",
        "To optimize performance",
        "To manage forms"
      ],
      correctAnswer: "To handle client-side routing"
    },
    {
      id: 7,
      question: "Which tool can you use to inspect React component hierarchies?",
      options: [
        "React Developer Tools",
        "Redux DevTools",
        "Chrome Inspector",
        "VS Code Debugger"
      ],
      correctAnswer: "React Developer Tools"
    },
    {
      id: 8,
      question: "What is the purpose of keys in React lists?",
      options: [
        "To improve security",
        "To help React identify which items have changed",
        "To enable sorting",
        "To provide styling"
      ],
      correctAnswer: "To help React identify which items have changed"
    },
    {
      id: 9,
      question: "Which function is used to create a context in React?",
      options: [
        "React.createContext()",
        "React.makeContext()",
        "React.newContext()",
        "React.context()"
      ],
      correctAnswer: "React.createContext()"
    },
    {
      id: 10,
      question: "What is the purpose of useMemo hook?",
      options: [
        "To memoize functions",
        "To memoize components",
        "To memoize values",
        "To memoize props"
      ],
      correctAnswer: "To memoize values"
    }];
  const software = [{
      id: 1,
      question: "What does PCI stand for in computer hardware?",
      options: [
        "Peripheral Component Interconnect",
        "Personal Computer Interface",
        "Processor Control Interface",
        "Portable Computer Interconnect"
      ],
      correctAnswer: "Peripheral Component Interconnect"
    },
    {
      id: 2,
      question: "Which component is responsible for storing the BIOS settings when the computer is powered off?",
      options: [
        "RAM",
        "CPU Cache",
        "CMOS Battery",
        "SSD"
      ],
      correctAnswer: "CMOS Battery"
    },
    {
      id: 3,
      question: "What is the primary purpose of a Northbridge in a chipset?",
      options: [
        "To manage USB devices",
        "To handle communication between CPU and high-speed devices",
        "To control power management",
        "To manage hard drive operations"
      ],
      correctAnswer: "To handle communication between CPU and high-speed devices"
    },
    {
      id: 4,
      question: "Which type of RAM is typically used in modern graphics cards?",
      options: [
        "DDR4",
        "GDDR6",
        "SRAM",
        "RDRAM"
      ],
      correctAnswer: "GDDR6"
    },
    {
      id: 5,
      question: "What does NVMe stand for in SSD technology?",
      options: [
        "Non-Volatile Memory express",
        "New Volume Memory extension",
        "Network Virtual Memory engine",
        "Native Virtual Machine emulation"
      ],
      correctAnswer: "Non-Volatile Memory express"
    },
    {
      id: 6,
      question: "Which component converts AC to DC power in a computer?",
      options: [
        "CPU",
        "GPU",
        "PSU",
        "SSD"
      ],
      correctAnswer: "PSU"
    },
    {
      id: 7,
      question: "What is the purpose of a heat sink in a computer?",
      options: [
        "To absorb and dissipate heat",
        "To store thermal energy",
        "To generate additional cooling power",
        "To measure temperature"
      ],
      correctAnswer: "To absorb and dissipate heat"
    },
    {
      id: 8,
      question: "Which interface is commonly used for connecting high-speed SSDs directly to the motherboard?",
      options: [
        "SATA",
        "PCIe",
        "USB-C",
        "Thunderbolt"
      ],
      correctAnswer: "PCIe"
    },
    {
      id: 9,
      question: "What does VRM stand for in motherboard specifications?",
      options: [
        "Voltage Regulation Module",
        "Virtual Reality Module",
        "Video Rendering Matrix",
        "Variable Resistance Mechanism"
      ],
      correctAnswer: "Voltage Regulation Module"
    },
    {
      id: 10,
      question: "Which type of cache memory is the fastest and closest to the CPU?",
      options: [
        "L1",
        "L2",
        "L3",
        "L4"
      ],
      correctAnswer: "L1"
    }];

  const handleApplyForTest = () => {
    
  };

  const handleSubmitTest = () => {
    setStatus("pending"); // After taking test
    setShowQuestions(false);
    // Send request to /ManageExpertsRequest
  };

  const renderQuestions = () => {
    const questions = expert.skill === "Hardware Repair" ? hardware : software;
    return (
      <div className="mt-6 space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="p-4 bg-white rounded shadow">
            <p className="font-semibold text-gray-700">{idx + 1}. {q.question}</p>
            <ul className="mt-2 space-y-1">
              {q.options.map((option, i) => (
                <li key={i}>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name={`q${q.id}`} className="accent-blue-500" />
                    <span>{option}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <button
          onClick={handleSubmitTest}
          className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Submit Test
        </button>
      </div>
    );
  };

  const renderStatusMessage = () => {
    switch (status) {
      case "pending":
        return <p className="mt-4 text-yellow-600 font-medium">Your test request is pending approval.</p>;
      case "approved":
        return (
          <>
            <p className="mt-4 text-green-600 font-medium">Your test is approved. Start answering below:</p>
            {renderQuestions()}
          </>
        );
      case "rejected":
        return (
          <div className="mt-4 text-red-600">
            <p className="font-bold">Test Failed</p>
            <p className="text-sm mt-1">
              آپ ٹیسٹ میں فیل ہو گئے ہیں۔ ہم آپ کی سروس اپنے سسٹم سے ہٹا رہے ہیں۔ اگر آپ ہمارے ساتھ دوبارہ کام کرنا چاہتے ہیں تو اچھی تیاری کے بعد دوبارہ درخواست دیں۔
            </p>
          </div>
        );
      case "not_applied":
      default:
        return (
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
            onClick={handleApplyForTest}
          >
            Apply for Test
          </button>
        );
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="w-full h-[70px] flex justify-between items-center bg-orange-500 border-b px-4 md:px-16 lg:px-[166px]">
        <h1 className="text-white text-2xl md:text-3xl font-bold">Expert Test</h1>
      </header>

      <main className="px-6 md:px-16 lg:px-[166px] mt-10 mb-10" role="main">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Instructions</h2>
        <ol className="list-decimal pl-5 text-gray-600 space-y-2">
          <li>Ensure your profile details are accurate and complete.</li>
          <li>Familiarize yourself with the test format and guidelines.</li>
          <li>Allocate sufficient uninterrupted time for the test.</li>
          <li>Use a stable internet connection to avoid disruptions.</li>
          <li>Adhere to the ethical code while attempting the test.</li>
        </ol>

        {/* Status Message or Test Button */}
        <div className="mt-6">
          {renderStatusMessage()}
        </div>
      </main>
    </div>
  );
};

export default ExpertTest;
