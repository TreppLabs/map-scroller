import Image from 'next/image'
import GridSVG from './gridSvg';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">

      <div>
        <GridSVG />
      </div>
    </main>
  )
}


