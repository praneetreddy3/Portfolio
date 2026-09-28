// All portfolio content lives here as plain data.
// Editing the site later just means editing these objects/arrays —
// no need to touch component/layout code at all.

export const profile = {
  name: "Sai Praneet Reddy Chinthala",
  pitch: "AI/ML & Data Engineer",
  tagline:
    "Building data-intelligent systems with RAG, LLMs & Machine Learning",
  location: "Fairfax, Virginia, United States",
  email: "praneetreddy66@gmail.com",
  github: "https://github.com/praneetreddy3",
  linkedin: "https://www.linkedin.com/in/sai-praneet-reddy-chinthala/",
  status: "Open to full-time opportunities",
  about: `M.S. Data Analytics Engineering graduate from George Mason University, with experience across industry internships, academic research, and teaching. I specialize in taking messy data and turning it into intelligent systems — whether that's building RAG pipelines, deploying ML models, or scaling ETL infrastructure. Currently collaborating with faculty on fairness in machine learning, exploring how bias manifests in real-world datasets and building mitigation strategies for production ML systems.`,
  bio: `What pulls me in is the point where data stops being rows and starts being a decision someone can act on. During my GenAI internship at Mahindra, most of the work was cleaning years of messy machine-service spreadsheets so a chatbot could tell a plant worker what had actually last been done to a machine — the model was the easy part. I taught the same idea as a TA for Big Data Essentials, walking two classes of about 35 students through how data gets processed in Databricks and stored in the cloud, and I'm putting it to use now as a volunteer data engineer at Saayam For All.`,
  highlights: [
    "Architecting end-to-end data & AI solutions that actually ship",
    "Writing clean, production-ready code and systems that scale",
    "Collaborating across teams to move ideas from whiteboard to production",
  ],
};

export const skills = {
  "AI & Data Engineering": [
    "RAG",
    "LLMs",
    "Machine Learning",
    "Feature Engineering",
    "Predictive Modeling",
    "NLP",
  ],
  "Big Data & Cloud": [
    "Apache Spark / PySpark",
    "Databricks",
    "AWS",
    "Azure",
    "ETL / ELT",
    "Hadoop",
  ],
  "Programming & Tools": [
    "Python",
    "SQL",
    "R",
    "LangChain",
    "scikit-learn",
    "XGBoost",
    "TensorFlow",
    "MongoDB",
    "MySQL",
  ],
};

export const experience = [
  {
    role: "Data Engineer (Volunteer)",
    org: "Saayam For All",
    dates: "Aug 2026 – Present",
    location: "Remote · Volunteer",
    bullets: [
      "Design, build, and maintain ETL pipelines for a 501(c)(3) nonprofit, extracting raw data, applying transformations, and loading it into structured storage systems.",
      "Write SQL queries and Python scripts to retrieve, clean, and aggregate data for business intelligence reporting, and manage data assets in AWS S3.",
      "Perform data quality checks, contribute to Power BI dashboards, and monitor daily pipeline runs alongside the engineering team.",
    ],
  },
  {
    role: "Graduate Teaching Assistant",
    org: "George Mason University — Dept. of Information Sciences & Technology",
    dates: "Jan 2026 – May 2026",
    location: "Fairfax, VA · On-site",
    bullets: [
      "Led hands-on lab sessions for AIT614: Big Data Essentials driven by AI, focusing on Spark and distributed data processing.",
      "Graded over 100 student code submissions, providing targeted feedback on big data implementations.",
      "Collaborated with faculty to improve course materials and lab exercises, aligning with industry standards.",
    ],
  },
  {
    role: "Generative AI Engineer",
    org: "Mahindra and Mahindra Limited",
    dates: "Feb 2024 – May 2024",
    location: "Pune, India · Remote",
    bullets: [
      "Modified and optimized a RAG-based chatbot system using Python and OpenAI embeddings.",
      "Developed a manufacturing knowledge base through data cleaning and merging for enhanced support.",
      "Implemented user authentication and a Streamlit UI for employee access across three plant locations.",
    ],
  },
  {
    role: "UI Technologies Intern",
    org: "Aspire InfoLabs",
    dates: "Jun 2023 – Jul 2023",
    location: "Hyderabad, India · On-site",
    bullets: [
      "Developed a full-stack MERN mentoring platform (MentorMe) connecting students with industry professionals — pitched at the Aspire InfoLabs Hackathon.",
      "Implemented JWT-based authentication, OTP verification, and a responsive React frontend with mentor-mentee matching.",
    ],
  },
];

export const education = [
  {
    school: "George Mason University",
    degree: "M.S., Data Analytics Engineering",
    dates: "Aug 2024 – May 2026",
    detail: "GPA: 3.97",
  },
  {
    school: "Mahindra University",
    degree: "B.Tech",
    dates: "2020 – 2024",
    detail: null,
  },
];

export const certifications = [
  {
    name: "Supervised Machine Learning: Regression and Classification",
    issuer: "DeepLearning.AI",
    date: "Sep 2022",
  },
];

export const research = {
  title: "Fair Bilevel Optimization for Collaborative Classification",
  dates: "Jan 2026 – Present",
  org: "George Mason University — Dept. of Information Sciences & Technology",
  description:
    "Independent research developing a bilevel optimization framework that enforces fairness constraints in federated learning across institutions, using synthetic data generation and Augmented Lagrangian methods to mitigate demographic bias in collaborative machine learning.",
  tags: ["Python", "PyTorch", "Federated Learning", "Fairness in ML"],
};

export const publication = {
  title: "Weather Prediction Using Machine Learning Techniques",
  venue:
    "International Journal of Scientific Research in Engineering and Management (IJSREM), Vol. 08, Issue 01",
  date: "January 2024",
  link: "https://lnkd.in/gA-b7rbB",
};

export const projects = [
  {
    title: "DAPSE: Arctic Policy Intelligence Engine",
    dates: "Jan 2026 – May 2026",
    featured: true,
    description:
      "Capstone project building a Retrieval-Augmented Generation engine over 955+ Arctic policy documents. Implemented hybrid retrieval combining BM25, FAISS, and Reciprocal Rank Fusion, a verify-then-escalate hallucination-mitigation workflow, and an 8-factor geopolitical risk-scoring engine. Owned scope and delivery across Agile sprints as Product Owner. Delivered as a client-sponsored capstone for National Security Innovations Inc.",
    tags: ["Python", "RAG", "BM25", "FAISS", "LangChain", "Agile"],
    metric: "955+ documents indexed",
    metrics: [
      { value: "955+", label: "documents indexed" },
      { value: "8", label: "risk factors scored" },
    ],
    flow: [
      "955+ Policy Docs",
      "BM25 + FAISS Retrieval",
      "Reciprocal Rank Fusion",
      "Verify-then-Escalate LLM",
      "8-Factor Risk Score",
    ],
    github: null,
    image: null, // drop a screenshot in src/assets/projects/ and reference it here, e.g. import img from "../assets/projects/bridges.png"
  },
  {
    title: "Senior Care RAG Agent",
    dates: "Aug 2026",
    featured: true,
    description:
      "Agentic RAG assistant answering questions about PACE, Medicare and Medicaid, grounded entirely in real CMS and state source documents with inline citations on every answer. The pipeline grades retrieved passages before generation and runs a self-verification pass afterwards, flagging anything not fully supported by its context. Benchmarked on a 54-question evaluation set written against the source PDFs, with an independent LLM judge scoring faithfulness, and an n8n monitor that re-runs the evaluation and alerts when retrieval or grounding regresses. Served via FastAPI, Streamlit and an MCP server, with Docker, CI and pytest coverage.",
    tags: ["RAG", "LangGraph", "FAISS", "FastAPI", "Docker", "Python"],
    metric: "0.98 grounded rate · 54-question eval",
    metrics: [
      { value: "0.93", label: "Hit@4 retrieval" },
      { value: "0.98", label: "grounded rate" },
    ],
    flow: [
      "User Query",
      "Semantic Retrieval (FAISS)",
      "Relevance Grading",
      "Grounded Generation",
      "Self-Verification + Citations",
    ],
    github: "https://github.com/praneetreddy3/senior-care-rag-agent",
    image: null,
  },
  {
    title: "Fair Bilevel Optimization for Collaborative Classification",
    dates: "Jan 2026 – Present",
    featured: true,
    description:
      "Independent research building a bilevel optimization framework enforcing fairness constraints in federated learning across institutions, using synthetic data generation and Augmented Lagrangian methods to mitigate demographic bias in collaborative ML.",
    tags: ["Python", "PyTorch", "Federated Learning", "Fairness"],
    metric: "Ongoing research",
    metrics: [{ value: "Ongoing", label: "active research" }],
    flow: [
      "Institution A Data",
      "Institution B Data",
      "Bilevel Optimization",
      "Augmented Lagrangian",
      "Fair Global Classifier",
    ],
    github: null,
    image: null, // drop a screenshot in src/assets/projects/ and reference it here, e.g. import img from "../assets/projects/bridges.png"
  },
  {
    title: "Bridges-NBI-Analysis",
    dates: "Aug 2025 – Dec 2025",
    featured: true,
    description:
      "Distributed PySpark batch pipeline processing 950K+ National Bridge Inventory records. Engineered 26 features, handled class imbalance, and tuned an XGBoost classifier from 0.75 to 0.93 ROC-AUC. Persisted results in MongoDB with automated Databricks SQL reporting.",
    tags: ["Apache Spark", "XGBoost", "MongoDB", "Databricks", "Python"],
    metric: "ROC-AUC 0.93 · 950K+ records",
    metrics: [
      { value: "0.93", label: "ROC-AUC" },
      { value: "950K+", label: "records processed" },
    ],
    flow: [
      "950K+ NBI Records",
      "PySpark ETL (26 features)",
      "Class Imbalance Handling",
      "XGBoost Tuning",
      "MongoDB + Databricks SQL",
    ],
    github: "https://github.com/praneetreddy3/Bridges-NBI-Analysis",
    image: null, // drop a screenshot in src/assets/projects/ and reference it here, e.g. import img from "../assets/projects/bridges.png"
  },
  {
    title: "MMU-RAG-NLP",
    dates: "Aug 2025 – Dec 2025",
    featured: true,
    description:
      "Multi-hop, cluster-aware Retrieval-Augmented Generation system for question answering. Combines SBERT embeddings, K-Means query clustering, two-hop retrieval refinement, and FLAN-T5 generation with confidence scoring — a 15–20% improvement over baseline single-hop RAG.",
    tags: ["SBERT", "K-Means", "FLAN-T5", "NLP", "RAG"],
    metric: "+15–20% over baseline RAG",
    metrics: [{ value: "+15–20%", label: "vs. baseline RAG" }],
    flow: [
      "User Query",
      "SBERT + K-Means Clustering",
      "Two-Hop Retrieval",
      "FLAN-T5 Generation",
      "Confidence Scoring",
    ],
    github: "https://github.com/praneetreddy3/MMU-RAG-NLP",
    image: null, // drop a screenshot in src/assets/projects/ and reference it here, e.g. import img from "../assets/projects/bridges.png"
  },
];

// Earlier coursework and independent projects. Kept for completeness but
// rendered as a compact list rather than full cards — nine projects at equal
// visual weight meant the strongest three got no more attention than the rest.
export const earlierWork = [
  {
    title: "Healthcare Financial Analysis",
    dates: "Aug 2024 – Dec 2024",
    metric: "CMS Cost Report 2021",
    tags: ['Python', 'MySQL', 'R', 'ETL'].map(String),
    github: "https://github.com/praneetreddy3/Healthcare-Financial-Analysis",
  },
  {
    title: "Car Price Prediction",
    dates: "Aug 2024 – Dec 2024",
    metric: "205 vehicles · 26 features",
    tags: ['R', 'LASSO', 'Regression', 'Statistics'].map(String),
    github: "https://github.com/praneetreddy3/Car-Price-Prediction",
  },
  {
    title: "Surrogate Model Optimization",
    dates: "Aug 2023 – Dec 2023",
    metric: "R² 0.97",
    tags: ['Gurobi', 'Random Forest', 'Optimization', 'Python'].map(String),
    github: "https://github.com/praneetreddy3/Surrogate-Model-Optimization",
  },
  {
    title: "Movie Recommendation System",
    dates: "Jan 2023 – Jun 2023",
    metric: "500K+ ratings processed",
    tags: ['Hadoop', 'MapReduce', 'Java', 'HDFS'].map(String),
    github: "https://github.com/praneetreddy3/Movie-Recommendations-Hadoop",
  },
  {
    title: "Fake News Detection",
    dates: "Jan 2022 – Jun 2022",
    metric: "~95% accuracy",
    tags: ['TensorFlow', 'LSTM', 'NLP', 'Keras'].map(String),
    github: "https://github.com/praneetreddy3/Fake-News-Detection",
  },
];
