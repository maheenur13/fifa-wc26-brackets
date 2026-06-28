import Image from "next/image";

const GITHUB = "https://github.com/maheenur13";
const PORTFOLIO = "https://jahidun-nur-mahee.vercel.app";

export default function SiteFooter() {
  return (
    <footer className="siteFooter">
      <a
        className="sfWho"
        href={GITHUB}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          className="sfAvatar"
          src="/maheenur13.png"
          alt="Mahee Nur"
          width={40}
          height={40}
        />
        <span className="sfWhoText">
          <b>Built by Mahee Nur</b>
          <em>@maheenur13 · I code everyday! ^_^</em>
        </span>
      </a>

      <nav className="sfLinks">
        <a href={GITHUB} target="_blank" rel="noopener noreferrer">
          GitHub ↗
        </a>
        <a href={PORTFOLIO} target="_blank" rel="noopener noreferrer">
          Portfolio ↗
        </a>
      </nav>

      <span className="sfNote">
        Unofficial fan project · not affiliated with FIFA · Dhaka 🇧🇩
      </span>
    </footer>
  );
}
