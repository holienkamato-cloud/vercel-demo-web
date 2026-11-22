import InquiryForm from "./InquiryForm";

export default function Home() {
  return (
    <main className="wrap">
      <h1>Nezáväzný dopyt</h1>
      <p className="lead">Vyplňte krátky formulár a ozveme sa vám s ponukou.</p>
      <InquiryForm />
    </main>
  );
}
