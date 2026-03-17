"use client";
import Image from "next/image";
import Lightning from '@/components/Lightning';
import SimpleDock from '@/components/SimpleDock';
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscCode, VscBook } from 'react-icons/vsc';

export default function IdentityKeychainPage() {
  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', href: '/' },
    { icon: <VscCode size={18} />, label: 'Projects', href: '/projects' },
    { icon: <VscBook size={18} />, label: 'Blog', href: '/blog' },
    { icon: <VscArchive size={18} />, label: 'Resume', href: '/resume' },
    { icon: <VscSettingsGear size={18} />, label: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0">
        <Lightning hue={0} xOffset={0} speed={1} intensity={1.05} size={1} />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-24 pb-40">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-wider text-red-300/70 font-semibold mb-3">Oct 6, 2025</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">The Identity Keychain</h1>

          {/* Added Image */}
          <div className="mt-6">
            <Image 
              src="blog-beads.jpg"   
              alt="Identity Keychain"
              width={600}
              height={400}
              className="rounded-2xl shadow-lg"
            />
          </div>
        </div>

        <article className="prose prose-invert max-w-none text-sm leading-relaxed space-y-4">
          <p>When I first constructed my keychain, I began to ponder whether or not the colors and string had a deeper meaning. I didn’t realize that each color actually reflects on who I am, what community I belong to, and what culture I am a part of. Identity is not just one singular characteristic; it's diverse, layered, and complex.</p>
          <p>The turquoise beads at the top show calmness and growth. Personally, I think calmness and growth are the roots of everything. Before you start anything you must be calm and willing to grow, even when life gets intense.This directly connects to white beads, white stands for honesty and clarity. I think the attributes for white is really important because some of the most successful relationships are dependent on honesty and clarity with both parties of the relationship. Furthermore, staying true to myself and being open with others is how I continue to develop and grow in a meaningful way.</p>
          <p>The green beads follow, embodying my love for nature. The color reminds me of the soccer fields where I spend hours practicing, playing, and coaching. Green is where honesty, growth, and renewal are tested. Conversely, green can also be represented as disgust from the movie inside out, we can identify that every single color has different meanings to different demographics. Green is merely an example of where the word can have two meanings: disgust, and nature. From the green beads the keychain shifts into the yellow beads, yellow is the color that symbolizes positivity and optimism. I placed it here because positivity grows out of the energy I put out into the world and into my hobbies. Yellow also represents the color of tennis balls which is my favourite sport and this color has a deep meaning to me.</p>
          <p>Additionally, the blue beads represent trust and responsibility. In my day-to-day life, optimism means little unless I can be counted on by my teammates, classmates, and the younger kids I coach. Blue is also my favourite color because it represents stability. Stability is really vital because without stability your life will be all over the place and stability is the binding factor in that situation. Red beads come next, red provokes the strongest emotions of any color. Red is linked to passion and love as well as power and anger. When I look at my keychain the red beads pop out to me because of its hue and strong presence. Likewise, in the movie inside out we can see that the color red represents anger and he is depicted as a fiery red figure. This paints the picture that red provokes a very powerful emotion.</p>
          <p>At the center, I placed a pattern of alternating black and white beads. Black and white combined reminds me of television back in the day. We can see that the colors on the outside of the keychain are very bright and lively colors but you can’t judge a book by its cover. When my grandfather passed away, the bright and lively part of me on the inside completely vanished and I became dull and monotonous. However, on the outside I was still the lively persona that everyone knew me as. This directly connects to the identity keychain where on the outside the colors are very calm and serene. Nonetheless, on the inside black and white. As said before white can mean honesty and clarity. But, in this case it's blank space and empty emotions. Black represents the darkness and the weight of loss that has been carried by me and my family.</p>
          <p>While constructing the identity keychain, I noticed how each value connects to the next: calmness leads to honesty, honesty really shapes connection, connection sparks positivity, positivity builds trust, trust fuels passion, and passion is balanced by life's highs and lows.</p>
          <p>This keychain also reminds me that my identity isn’t just one singular thing. It is layered through my roles as a student, athlete, coach, family member, and community member. Each part intersects to shape who I am just like how each bead is connected by the same thread.</p>
        </article>
      </div>
      <SimpleDock items={dockItems} />
    </div>
  );
}
