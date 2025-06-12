import Image from 'next/image';

export default function Footer() {
  return (
    <footer className='max-w-4xl mx-auto flex items-center justify-center self-end gap-12 py-4'>
      <Image src={'/LogoUNA.png'} width={150} height={150} alt={'Logo UNA'} />
    </footer>
  );
}
