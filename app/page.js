
import Image from "next/image";
import H from './components/Heading'
import P from './components/Paragraph'

export default function Home() {
  return (
    <div className="h-[100vh] w-[100vw] fixed flex flex-col items-center justify-center bg-[url('/hero-vector.png')]">
      {/* Excited to announce PESU Placement Tales (PPT) - your go-to resource for 
      company-specific preparation insights! Learn directly from successful candidates 
      who've cracked these companies before. Are you an offered student? 
      Pay it forward by sharing your experience to help upcoming batches. Preparing for 
      online assessments or interviews? PPT is your ultimate guide! We're constantly 
      improving, so feel free to suggest new features or report any bugs. Join PPT today 
      and boost your placement journey with peer-powered knowledge! */}
      <H text={" 🚀 PESU Placement Tales ✨"} styles = "text-gray-800"/>
      <P text={`Get insights directly from successful candidates who've aced their interviews. If you’re a student with an offer, share your experience to support future batches. Whether you're prepping for assessments or interviews, PPT is your go-to resource. We’re always evolving, so share your feedback and suggestions. Join PPT today and enhance your placement journey with the power of peer knowledge! ✅`} styles = 'md:w-[50%]'/>
    </div>
  );
}
