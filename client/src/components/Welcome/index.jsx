import homeVideo from "../../assets/green.webm";
export default function Welcome() {
  return (
    <div className="self-center text-center">
      <video
        src={homeVideo}
        width="720"
        autoPlay
        loop
        muted
        playsInline
      ></video>
      <h1 className="mb-4 text-4xl font-bold">Welcome to Orbi</h1>
      <p className="text-lg">Your AI-powered chat assistant.</p>
    </div>
  );
}
