import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase/config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const ExpertQuiz = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(120);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
    const [hasStarted, setHasStarted] = useState(false);

    // Software Quiz
    const softwareQuestions = [
        {
            id: 1,
            question: "What is the first step in troubleshooting a software issue?",
            options: [
                "Reinstall the software",
                "Check for updates",
                "Identify the problem",
                "Restart the computer"
            ],
            correctAnswer: "Identify the problem"
        },
        {
            id: 2,
            question: "Which tool can help identify issues in Windows?",
            options: ["Task Manager", "Control Panel", "CMD", "Paint"],
            correctAnswer: "Task Manager"
        },
        {
            id: 3,
            question: "What does 'Safe Mode' do?",
            options: [
                "Increases screen brightness",
                "Runs only essential software/drivers",
                "Deletes temporary files",
                "Starts antivirus scan"
            ],
            correctAnswer: "Runs only essential software/drivers"
        },
        {
            id: 4,
            question: "Which of the following is a common reason for software crash?",
            options: ["Overheating", "Insufficient RAM", "Outdated OS", "Driver error"],
            correctAnswer: "Insufficient RAM"
        },
        {
            id: 5,
            question: "What is the best first action if a program freezes?",
            options: ["Uninstall it", "Reboot", "Force close it", "Format computer"],
            correctAnswer: "Force close it"
        },
        {
            id: 6,
            question: "Which command is used to check internet connectivity in CMD?",
            options: ["dir", "ipconfig", "ping", "cls"],
            correctAnswer: "ping"
        },
        {
            id: 7,
            question: "What does a system restore do?",
            options: [
                "Removes viruses",
                "Restores Windows settings to earlier point",
                "Formats the hard drive",
                "Reinstalls drivers"
            ],
            correctAnswer: "Restores Windows settings to earlier point"
        },
        {
            id: 8,
            question: "Which of the following can slow down software performance?",
            options: ["Too many background apps", "Fast CPU", "SSD drive", "High RAM"],
            correctAnswer: "Too many background apps"
        },
        {
            id: 9,
            question: "Which tool is used to manage startup programs in Windows?",
            options: ["MSConfig", "Notepad", "Calculator", "Registry Editor"],
            correctAnswer: "MSConfig"
        },
        {
            id: 10,
            question: "Which extension is usually associated with executable files?",
            options: [".exe", ".doc", ".mp3", ".pdf"],
            correctAnswer: ".exe"
        },
    ];

    // Hardware Quiz
    const hardwareQuestions = [
        {
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
            question: "Which component is considered the 'brain' of the computer?",
            options: ["RAM", "CPU", "Hard Drive", "GPU"],
            correctAnswer: "CPU"
        },
        {
            id: 3,
            question: "What type of memory is non-volatile and used to store firmware?",
            options: ["RAM", "ROM", "Cache", "SSD"],
            correctAnswer: "ROM"
        },
        {
            id: 4,
            question: "Which port is commonly used for monitors?",
            options: ["USB", "VGA", "Ethernet", "Audio Jack"],
            correctAnswer: "VGA"
        },
        {
            id: 5,
            question: "What does PSU stand for?",
            options: [
                "Primary System Unit",
                "Power Supply Unit",
                "Peripheral Storage Unit",
                "Processing Speed Unit"
            ],
            correctAnswer: "Power Supply Unit"
        },
        {
            id: 6,
            question: "What is the function of the motherboard?",
            options: [
                "Connects all hardware components",
                "Stores data",
                "Generates electricity",
                "Executes programs"
            ],
            correctAnswer: "Connects all hardware components"
        },
        {
            id: 7,
            question: "Which storage type is faster?",
            options: ["HDD", "CD-ROM", "SSD", "DVD"],
            correctAnswer: "SSD"
        },
        {
            id: 8,
            question: "Which is NOT an input device?",
            options: ["Mouse", "Keyboard", "Scanner", "Speaker"],
            correctAnswer: "Speaker"
        },
        {
            id: 9,
            question: "Which hardware is used to cool the CPU?",
            options: ["Heatsink", "Fan", "Thermal Paste", "All of these"],
            correctAnswer: "All of these"
        },
        {
            id: 10,
            question: "What unit is used to measure CPU speed?",
            options: ["GHz", "MB", "Watt", "RPM"],
            correctAnswer: "GHz"
        },
    ];


    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const q = query(collection(db, "FYPusers"), where("uid", "==", user.uid));
                const querySnapshot = await getDocs(q);

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    console.log("User Role:", data.role);
                    console.log("Specialization:", data.specialization);

                    if (data.role === "expert") {
                        if (data.specialization === "hardware") {
                            setQuestions(hardwareQuestions);
                        } else if (data.specialization === "Software Troubleshooting") {
                            setQuestions(softwareQuestions);
                        }
                    }
                });

                setLoading(false);
            } else {
                console.warn("User not logged in");
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);


    // Timer Countdown
    useEffect(() => {
        if (submitted) return;

        const countdown = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(countdown);
                    handleSubmit(); // Auto-submit on time up
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdown);
    }, [submitted]);

    // Handle answer change
    const handleAnswerChange = (qId, selectedOption) => {
        setAnswers((prev) => ({ ...prev, [qId]: selectedOption }));
    };

    // Calculate score
    const handleSubmit = async () => {
        let correct = 0;
        questions.forEach((q) => {
            if (answers[q.id] === q.correctAnswer) {
                correct++;
            }
        });
        setScore(correct);
        setSubmitted(true);

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                await addDoc(collection(db, "ExpertQuiz"), {
                    uid: user.uid,
                    email: user.email,
                    score: correct,
                    total: questions.length,
                    percentage: ((correct / questions.length) * 100).toFixed(2),
                    result: correct >= 6 ? "Pass" : "Fail", // you can set the threshold
                    submittedAt: serverTimestamp(),
                    status: "Pending", // default, admin will update to Accepted/Rejected
                });
            }
        } catch (err) {
            console.error("Error submitting quiz to DB:", err);
        }
    };


    if (loading) return <div className="p-4">Loading quiz...</div>;

    return (
        <>
            {/* Header */}
            <header className="w-full h-[70px] flex justify-between items-center bg-orange-500 border-b px-4 md:px-16 lg:px-[166px]">
                <h1 className="text-white text-2xl md:text-3xl font-bold">Expert Quiz</h1>
            </header>

            {/* Main Content */}
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-4 py-8 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl p-6 sm:p-10">

                    {/* === If Quiz has not started === */}
                    {!hasStarted ? (
                        <div className="text-center space-y-6">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">📝 Quiz Instructions</h2>
                            <ul className="text-gray-700 text-left list-disc list-inside text-base sm:text-lg space-y-2">
                                <li><strong>Time Limit:</strong> You have <span className="font-semibold text-orange-600">2 minutes</span> to complete the quiz.</li>
                                <li><strong>Questions:</strong> There are <span className="font-semibold text-orange-600">10</span> multiple-choice questions.</li>
                                <li>Each question has only one correct answer.</li>
                                <li>Use <span className="font-semibold text-orange-600">"Next"</span> and <span className="font-semibold text-orange-600">"Previous"</span> to navigate.</li>
                                <li>Progress bar shows your completion status.</li>
                                <li><strong>Note:</strong> Once submitted, answers cannot be changed.</li>
                            </ul>
                            <button
                                onClick={() => setHasStarted(true)}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg text-base sm:text-lg transition duration-300"
                            >
                                Start Quiz
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Header with Timer */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">🧠 Expert Quiz</h2>
                                {!submitted && (
                                    <div className="text-sm sm:text-base text-red-600 font-semibold">
                                        ⏱️ {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                                    </div>
                                )}
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
                                <div
                                    className={`h-4 transition-all duration-300 ease-in-out ${progressPercent < 40
                                        ? 'bg-red-500'
                                        : progressPercent < 80
                                            ? 'bg-yellow-500'
                                            : 'bg-green-500'
                                        }`}
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>

                            {/* Quiz Section */}
                            {!submitted ? (
                                <>
                                    {/* Single Question View */}
                                    <div
                                        key={questions[currentQuestionIndex].id}
                                        className="mb-6 bg-gray-100 rounded-lg border border-gray-300 p-5 transition hover:shadow-md"
                                    >
                                        <p className="text-base sm:text-lg font-semibold text-gray-700 mb-3">
                                            {currentQuestionIndex + 1}. {questions[currentQuestionIndex].question}
                                        </p>
                                        <div className="grid gap-3">
                                            {questions[currentQuestionIndex].options.map((option, idx) => (
                                                <label
                                                    key={idx}
                                                    className="flex items-center gap-3 cursor-pointer text-gray-700 text-sm sm:text-base hover:text-blue-600 transition"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`q-${questions[currentQuestionIndex].id}`}
                                                        value={option}
                                                        checked={answers[questions[currentQuestionIndex].id] === option}
                                                        onChange={() =>
                                                            handleAnswerChange(questions[currentQuestionIndex].id, option)
                                                        }
                                                        className="w-4 h-4 accent-blue-600"
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="flex justify-between">
                                        <button
                                            disabled={currentQuestionIndex === 0}
                                            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded disabled:opacity-50"
                                        >
                                            Previous
                                        </button>

                                        {currentQuestionIndex < questions.length - 1 ? (
                                            <button
                                                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded"
                                            >
                                                Next
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleSubmit}
                                                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded"
                                            >
                                                Submit Quiz
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                // Result View
                                <div className="text-center">
                                    <h3 className="text-xl sm:text-2xl font-bold text-green-600 mb-3">🎉 Quiz Submitted</h3>
                                    <p className="text-lg font-medium text-gray-800 mb-1">
                                        You scored <span className="text-blue-600 font-bold">{score}</span> out of{" "}
                                        {questions.length}
                                    </p>
                                    <p className="text-lg font-medium text-gray-800">
                                        Percentage:{" "}
                                        <span className="text-blue-500 font-bold">
                                            {(score / questions.length * 100).toFixed(2)}%
                                        </span>
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );



};

export default ExpertQuiz;
