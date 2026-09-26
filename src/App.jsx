import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import ErrorBoundary from "./components/ErrorBoundary";
import ChatWidget from "./components/chatbot/ChatWidget";

function App() {
  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Keyboard and screen-reader users shouldn't have to tab through the
          whole nav on every page load to reach the content. Visually hidden
          until focused. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded focus:border focus:border-accent focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-mono focus:text-accent"
      >
        Skip to content
      </a>

      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>

      {/* A crash inside the chatbot must not blank the portfolio. */}
      <ErrorBoundary>
        <ChatWidget />
      </ErrorBoundary>
    </div>
  );
}

export default App;
