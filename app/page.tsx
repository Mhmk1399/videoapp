import VideoEditor from "@/components/VideoEditor";

const page = () => {
  return (
    <div>
    <div className="App">
      <header className="App-header">
        <h1>Video Editing App</h1>
      </header>
      <main>
        <VideoEditor  />
      </main>
      <footer>
        <p>Video Editing Web Application</p>
      </footer>
    </div>
    </div>
  );
};

export default page;
