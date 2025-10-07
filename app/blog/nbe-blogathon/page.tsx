"use client";
import Lightning from '@/components/Lightning';
import SimpleDock from '@/components/SimpleDock';
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscCode, VscBook } from 'react-icons/vsc';
import { motion } from 'framer-motion';
import { blogPosts } from '@/lib/blogPosts';
import Image from 'next/image';

export default function NbeBlogathonPost() {
  const handleNavigation = (path: string) => { try { window.location.href = path; } catch { window.location.assign(path); } };
  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', onClick: () => handleNavigation('/') },
    { icon: <VscCode size={18} />, label: 'Projects', onClick: () => handleNavigation('/projects') },
    { icon: <VscBook size={18} />, label: 'Blog', onClick: () => handleNavigation('/blog') },
    { icon: <VscAccount size={18} />, label: 'About', onClick: () => handleNavigation('/about') },
    { icon: <VscArchive size={18} />, label: 'Resume', onClick: () => alert('Resume!') },
    { icon: <VscSettingsGear size={18} />, label: 'Contact', onClick: () => alert('Contact!') },
  ];
  const post = blogPosts.find(p=>p.slug==='nbe-blogathon');
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0"><Lightning hue={0} xOffset={0} speed={1} intensity={1.05} size={1} /></div>
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-24 pb-40">
        <motion.h1 className="text-4xl md:text-5xl font-bold text-white mb-6" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.8}}>{post?.title}</motion.h1>
        <motion.p className="text-xs uppercase tracking-wider text-red-300/70 font-semibold mb-6" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}}>
          {post ? new Date(post.date).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}) : ''} {post?.tags && '• ' + post.tags.join(' / ')}
        </motion.p>
  <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.2}} className="space-y-8 max-w-none text-[15px] leading-relaxed text-white/90 bg-black/40 rounded-xl p-6 border border-white/10 backdrop-blur-sm shadow-md">
          {post?.image && (
            <figure className="mx-auto w-full max-w-xl rounded-2xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-sm shadow-lg">
              <div className="relative aspect-[3/5] w-full">
                <Image
                  src={post.image}
                  alt={post.title || 'The Story of Colors image'}
                  fill
                  sizes="(max-width: 768px) 80vw, 600px"
                  className="object-cover object-center"
                  priority
                  onError={(e)=>{
                    const img = e.currentTarget as HTMLImageElement & { src?: string };
                    img.src = '/placeholder.jpg';
                  }}
                />
              </div>
            </figure>
          )}
          <p>When I first constructed my keychain, I began to ponder whether or not the colors and string had a deeper meaning. I didn’t realize that each color actually reflects on who I am, what community I belong to, and what culture I am a part of. Identity is not just one singular characteristic; it's diverse, layered, and complex.</p>
          <p>The turquoise beads at the top show calmness and growth. Personally, I think calmness and growth are the roots of everything. Before you start anything you must be calm and willing to grow, even when life gets intense.This directly connects to white beads, white stands for honesty and clarity. I think the attributes for white is really important because some of the most successful relationships are dependent on honesty and clarity with both parties of the relationship. Furthermore, staying true to myself and being open with others is how I continue to develop and grow in a meaningful way.</p>
          <p>The green beads follow, embodying my love for nature. The color reminds me of the soccer fields where I spend hours practicing, playing, and coaching. Green is where honesty, growth, and renewal are tested. Conversely, green can also be represented as disgust from the movie inside out, we can identify that every single color has different meanings to different demographics. Green is merely an example of where the word can have two meanings: disgust, and nature. From the green beads the keychain shifts into the yellow beads, yellow is the color that symbolizes positivity and optimism. I placed it here because positivity grows out of the energy I put out into the world and into my hobbies. Yellow also represents the color of tennis balls which is my favourite sport and this color has a deep meaning to me.</p>
          <p>Additionally, the blue beads represent trust and responsibility. In my day-to-day life, optimism means little unless I can be counted on by my teammates, classmates, and the younger kids I coach. Blue is also my favourite color because it represents stability. Stability is really vital because without stability your life will be all over the place and stability is the binding factor in that situation. Red beads come next, red provokes the strongest emotions of any color. Red is linked to passion and love as well as power and anger. When I look at my keychain the red beads pop out to me because of its hue and strong presence. Likewise, in the movie inside out we can see that the color red represents anger and he is depicted as a fiery red figure. This paints the picture that red provokes a very powerful emotion.</p>
          <p>At the center, I placed a pattern of alternating black and white beads. Black and white combined reminds me of television back in the day. We can see that the colors on the outside of the keychain are very bright and lively colors but you can’t judge a book by its cover. When my grandfather passed away, the bright and lively part of me on the inside completely vanished and I became dull and monotonous. However, on the outside I was still the lively persona that everyone knew me as. This directly connects to the identity keychain where on the outside the colors are very calm and serene. Nonetheless, on the inside black and white. As said before white can mean honesty and clarity. But, in this case it's blank space and empty emotions. Black represents the darkness and the weight of loss that has been carried by me and my family.</p>
          <p>While constructing the identity keychain, I noticed how each value connects to the next: calmness leads to honesty, honesty really shapes connection, connection sparks positivity, positivity builds trust, trust fuels passion, and passion is balanced by life's highs and lows.</p>
          <p>This keychain also reminds me that my identity isn’t just one singular thing. It is layered through my roles as a student, athlete, coach, family member, and community member. Each part intersects to shape who I am just like how each bead is connected by the same thread.</p>
          {post?.videoUrl && (
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black/40">
              <iframe
                src={post.videoUrl.replace('watch?v=','embed/')}
                title="YouTube video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          <div className="pt-4">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-4" />
            <h2 className="text-xs tracking-widest font-semibold text-white/60 mb-3 uppercase">Works Cited</h2>
            <ol className="list-decimal list-inside space-y-2 text-white/70 text-[13px] leading-relaxed">
              <li>&ldquo;Are Black &amp; White Colors?&rdquo; <em>Color Matters</em>, <a className="underline decoration-dotted hover:text-white" href="https://www.colormatters.com/color-and-design/are-black-and-white-colors" target="_blank" rel="noopener noreferrer">https://www.colormatters.com/color-and-design/are-black-and-white-colors</a>. Accessed 6 Oct. 2025.</li>
              <li>&ldquo;BLUE Definition &amp; Meaning.&rdquo; <em>Merriam-Webster</em>, <a className="underline decoration-dotted hover:text-white" href="https://www.merriam-webster.com/dictionary/blue" target="_blank" rel="noopener noreferrer">https://www.merriam-webster.com/dictionary/blue</a>. Accessed 6 Oct. 2025.</li>
              <li>Cherry, Kendra. &ldquo;Psychology of the Color Red.&rdquo; <em>Verywell Mind</em>, 28 Jun. 2023, <a className="underline decoration-dotted hover:text-white" href="https://www.verywellmind.com/the-color-psychology-of-red-2795821" target="_blank" rel="noopener noreferrer">https://www.verywellmind.com/the-color-psychology-of-red-2795821</a>. Accessed 6 Oct. 2025.</li>
              <li>&ldquo;The Color Green.&rdquo; <em>Empower Yourself with Color Psychology</em>, <a className="underline decoration-dotted hover:text-white" href="https://www.empower-yourself-with-color-psychology.com/color-green.html" target="_blank" rel="noopener noreferrer">https://www.empower-yourself-with-color-psychology.com/color-green.html</a>. Accessed 6 Oct. 2025.</li>
              <li>&ldquo;Everything about the color Turquoise.&rdquo; <em>Canva</em>, <a className="underline decoration-dotted hover:text-white" href="https://www.canva.com/colors/color-meanings/turquoise/" target="_blank" rel="noopener noreferrer">https://www.canva.com/colors/color-meanings/turquoise/</a>. Accessed 6 Oct. 2025.</li>
              <li>&ldquo;Everything about the color Yellow.&rdquo; <em>Canva</em>, <a className="underline decoration-dotted hover:text-white" href="https://www.canva.com/colors/color-meanings/yellow/" target="_blank" rel="noopener noreferrer">https://www.canva.com/colors/color-meanings/yellow/</a>. Accessed 6 Oct. 2025.</li>
              <li>&ldquo;GREEN Definition &amp; Meaning.&rdquo; <em>Merriam-Webster</em>, 4 Oct. 2025, <a className="underline decoration-dotted hover:text-white" href="https://www.merriam-webster.com/dictionary/green" target="_blank" rel="noopener noreferrer">https://www.merriam-webster.com/dictionary/green</a>. Accessed 6 Oct. 2025.</li>
              <li>&ldquo;Inside Out (2015).&rdquo; <em>IMDb</em>, <a className="underline decoration-dotted hover:text-white" href="https://www.imdb.com/title/tt2096673/" target="_blank" rel="noopener noreferrer">https://www.imdb.com/title/tt2096673/</a>. Accessed 6 Oct. 2025.</li>
              <li>&ldquo;WHITE | English meaning - Cambridge Dictionary.&rdquo; <em>Cambridge Dictionary</em>, 1 Oct. 2025, <a className="underline decoration-dotted hover:text-white" href="https://dictionary.cambridge.org/dictionary/english/white" target="_blank" rel="noopener noreferrer">https://dictionary.cambridge.org/dictionary/english/white</a>. Accessed 6 Oct. 2025.</li>
            </ol>
          </div>
          {/* Removed duplicate image section after cropping; placeholder paragraph removed per requestl */}
        </motion.div>
      </div>
      <SimpleDock items={dockItems} />
    </div>
  );
}
