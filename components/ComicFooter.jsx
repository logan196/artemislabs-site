"use client";

import Reveal from "./Reveal";

// A little honesty before the sign-off.
export default function ComicFooter() {
  return (
    <section aria-label="Comic" className="px-6 md:px-14 pt-4 pb-10 max-w-7xl mx-auto">
      <Reveal className="max-w-md mx-auto text-center">
        <a href="https://xkcd.com/1838/" target="_blank" rel="noreferrer" className="block rounded-[4px] border border-line bg-white p-4 hover:border-violet/50 transition-colors">
          <img
            src="xkcd_ml.png"
            alt="xkcd comic: 'This is your machine learning system?' 'Yup! You pour the data into this big pile of linear algebra, then collect the answers on the other side.' 'What if the answers are wrong?' 'Just stir the pile until they start looking right.'"
            className="w-full"
          />
        </a>
        <p className="mt-3 text-[13px] text-dim leading-relaxed">
          <a href="https://xkcd.com/1838/" target="_blank" rel="noreferrer" className="text-violet hover:underline">xkcd #1838</a> by
          Randall Munroe · <a href="https://xkcd.com/license.html" target="_blank" rel="noreferrer" className="hover:underline">CC BY-NC 2.5</a>.
          We stir responsibly — every number on this page traces to the run that made it.
        </p>
      </Reveal>
    </section>
  );
}
