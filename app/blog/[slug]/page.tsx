import Lightning from '@/components/Lightning';
import SimpleDock from '@/components/SimpleDock';
import BlogHeroImage from '@/components/BlogHeroImage';
import { blogPosts } from '@/lib/blogPosts';
import { notFound } from 'next/navigation';
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscCode, VscBook } from 'react-icons/vsc';
import { Metadata } from 'next';

interface PageProps { params: { slug: string } }

export function generateStaticParams() {
  return blogPosts.map(p => ({ slug: p.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = blogPosts.find(p => p.slug === params.slug);
  if (!post) return { title: 'Post Not Found' };
  const title = post.title + ' | Blog';
  return {
    title,
    description: post.excerpt,
    openGraph: {
      title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: 'article'
    },
    twitter: {
      card: 'summary',
      title,
      description: post.excerpt
    }
  };
}

export default function BlogSlugPage({ params }: PageProps) {
  const post = blogPosts.find(p => p.slug === params.slug);
  if (!post) return notFound();

  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', href: '/' },
    { icon: <VscCode size={18} />, label: 'Projects', href: '/projects' },
    { icon: <VscBook size={18} />, label: 'Blog', href: '/blog' },
    { icon: <VscAccount size={18} />, label: 'About', href: '/about' },
    { icon: <VscArchive size={18} />, label: 'Resume', href: '/resume' },
    { icon: <VscSettingsGear size={18} />, label: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0"><Lightning hue={0} xOffset={0} speed={1} intensity={1} size={0.5} /></div>
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-24 pb-40">
        <div className="mb-10 transition-opacity duration-700">
          <p className="text-xs uppercase tracking-wider text-red-300/70 font-semibold mb-3">
            {new Date(post.date).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{post.title}</h1>
          <p className="text-gray-300 text-base leading-relaxed max-w-2xl">{post.excerpt}</p>
          {post.tags && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map(tag => (
                <span key={tag} className="text-[11px] px-2 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">{tag}</span>
              ))}
            </div>
          )}
          {post.image && (
            <div className="w-full mt-8 rounded-xl border border-white/10 bg-black/30 overflow-hidden">
              <BlogHeroImage
                src={post.image}
                alt={post.title}
                className="w-full h-auto block object-contain sm:object-contain"
                sizes="(max-width: 640px) 100vw, 640px"
                priority
              />
            </div>
          )}
  </div>
  <div className="prose prose-invert max-w-none text-sm leading-relaxed space-y-4">
    {post.slug === 'nbe-blogathon' && (
      <>
        <p>When I first constructed my keychain, I began to ponder whether or not the colors and string had a deeper meaning. I didn’t realize that each color actually reflects on who I am, what community I belong to, and what culture I am a part of. Identity is not just one singular characteristic; it's diverse, layered, and complex.</p>
        <p>The turquoise beads at the top show calmness and growth. Personally, I think calmness and growth are the roots of everything. Before you start anything you must be calm and willing to grow, even when life gets intense.This directly connects to white beads, white stands for honesty and clarity. I think the attributes for white is really important because some of the most successful relationships are dependent on honesty and clarity with both parties of the relationship. Furthermore, staying true to myself and being open with others is how I continue to develop and grow in a meaningful way.</p>
        <p>The green beads follow, embodying my love for nature. The color reminds me of the soccer fields where I spend hours practicing, playing, and coaching. Green is where honesty, growth, and renewal are tested. Conversely, green can also be represented as disgust from the movie inside out, we can identify that every single color has different meanings to different demographics. Green is merely an example of where the word can have two meanings: disgust, and nature. From the green beads the keychain shifts into the yellow beads, yellow is the color that symbolizes positivity and optimism. I placed it here because positivity grows out of the energy I put out into the world and into my hobbies. Yellow also represents the color of tennis balls which is my favourite sport and this color has a deep meaning to me.</p>
        <p>Additionally, the blue beads represent trust and responsibility. In my day-to-day life, optimism means little unless I can be counted on by my teammates, classmates, and the younger kids I coach. Blue is also my favourite color because it represents stability. Stability is really vital because without stability your life will be all over the place and stability is the binding factor in that situation. Red beads come next, red provokes the strongest emotions of any color. Red is linked to passion and love as well as power and anger. When I look at my keychain the red beads pop out to me because of its hue and strong presence. Likewise, in the movie inside out we can see that the color red represents anger and he is depicted as a fiery red figure. This paints the picture that red provokes a very powerful emotion.</p>
        <p>At the center, I placed a pattern of alternating black and white beads. Black and white combined reminds me of television back in the day. We can see that the colors on the outside of the keychain are very bright and lively colors but you can’t judge a book by its cover. When my grandfather passed away, the bright and lively part of me on the inside completely vanished and I became dull and monotonous. However, on the outside I was still the lively persona that everyone knew me as. This directly connects to the identity keychain where on the outside the colors are very calm and serene. Nonetheless, on the inside black and white. As said before white can mean honesty and clarity. But, in this case it's blank space and empty emotions. Black represents the darkness and the weight of loss that has been carried by me and my family.</p>
        <p>While constructing the identity keychain, I noticed how each value connects to the next: calmness leads to honesty, honesty really shapes connection, connection sparks positivity, positivity builds trust, trust fuels passion, and passion is balanced by life's highs and lows.</p>
        <p>This keychain also reminds me that my identity isn’t just one singular thing. It is layered through my roles as a student, athlete, coach, family member, and community member. Each part intersects to shape who I am just like how each bead is connected by the same thread.</p>
        {post.videoUrl && (
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
      </>
    )}
    {post.slug === 'uncovering-my-equilibrium' && (
      <>
        <div className="mb-8">
          <div className="text-sm text-white/70 leading-relaxed">
            <p>Ishaan Dhiman</p>
            <p>Professor Mackenzie Martin</p>
            <p>NBE3UI-01</p>
            <p>26 October 2025</p>
          </div>
          <h1 className="text-2xl font-bold text-white mt-6 mb-8 text-center">Uncovering my Equilibrium</h1>
        </div>

        <p className="indent-8">After a lengthy trip from the Sunshine State of the United States of America, I was at peace with my inner self, I was determined to get back into my day-to-day routine ASAP. The car smelled faintly of coffee and of cold air as we travelled further and further north. Glancing at the car seat in front of me, my mind wandered about seeing my family again. As I entered through my front door, my parents' faces said more than just words.</p>

        <p>This horrid news left me in awe. It felt like I had no sense, awareness, or reality. I was not able to process the emotions I was feeling. Once my evenings were filled with laughter and warmth; now, silence had taken their place. It was a different dimension of my emotional state that I had just tapped into. For days on end, I felt isolated from everything and everyone around me. Even my usual routine of coming home from school and doomscrolling for 1-2 hours changed to 3 hours of staring at the wall pondering and extensive hours of silence. My appetite dissipated from sight. The foods I enjoyed really had no taste anymore, the smell of dinner reminded me of emptiness. In my house food is enjoyed whenever a family member cooks because it's made out of compassion and you cannot replicate this level of compassion from Uber Eats. However, when we were ordering out every day because my father and mother were in India while I was back home with my aunt. This made the sensory experience of food dull, dreary, and depressing.</p>

        <p>I believe that the Medicine Wheel should stay in proportion to ¼ to each other. This is the reason why some people are successful because they have time and the headspace for everything. "I forget the need to sometimes step back, take a deep breath, meditate, take a walk, and enjoy the smell of the flowers" (Anderson). This shows that true success is not just about working hard but also taking time for self-care and balancing the physical, mental, emotional, and spiritual aspects of life, which is symbolized by the Medicine Wheel. When I was faced with this disconsolate experience, I was overloaded with the emotion section of the Medicine Wheel. When one domain takes over, the others naturally fall apart. Because my emotional sector was so overloaded, I lost my appetite directly influencing my physical part, and I felt constantly drained. My mental focus eroded away; I couldn't concentrate in class or keep up with my usual interests. Even spiritually I felt disconnected questioning God why such sorrowful things happen to us humans.</p>

        <p>At some point, I realized that this severity of imbalance wasn't something that would automatically mend itself, I had to take baby steps to regain my inner harmony with all of my systems. My grandfather always taught me the importance of patience and routine, and I found myself returning to his wise words and began eating more, not because I was hungry but because I needed to regain that harmony in myself again. I spent time outside, doing some very odd things like riding my bicycle on ice and almost suffering a minor concussion. I let the breeze hit my face as I recollected as I thought to myself about my past couple of weeks, and for the first time in a couple of weeks I felt a sense of clarity. Spiritually I really started to understand that grief is not the absence of connection but is a continuation of relation in a new form. Remembering his laughter and stories reminded me of his wisdom and ability. The balance of the Medicine Wheel was not restored in an instant. However, it was restored through a process.</p>

        <p>My grandfather was a wise man just like many elderly people. But the root of why the elderly is so wise and why they give so many different perspectives and dimensions to different things in our lives. Oosthuizen says that, as people age, their thinking evolves, becoming more focused on their ability towards specific fields. An example of this is that my grandfather was an electrician, so he has a deep knowledge of that field. However, after retirement instead of completely quitting his concepts, he practiced more practical applications by more pen to paper style instead of real world applications in that field because he is unable to do so as he is retired and doesn't have access to those materials anymore. This shift towards integrative thinking, concatenating experiences with knowledge, really allows for flexible and complex thinking.</p>

        <p>The importance of the medicine wheel lies in its ability to guide the balance and equilibrium in one's life. It gives us a reminder that true-wellbeing cannot exist when one aspect of the wheel is neglected (Mental, Emotional, Physical, and Spiritual). As Elder Mary Lee once said, "When one part of the wheel is broken, the whole circle falls apart." This shows how every part of life is interconnected, and it must be nurtured equally. The wheel encourages mindfulness, self-consciousness, and deep knowledge on the balance between all of us. By using the wheel as a guide, people live to learn with its teachings, which causes us to learn with compassion and understanding, which balances the world.</p>

        <p>In light of the above, I learned that balance is not found; balance is built; balance is lived. Losing my grandfather threw my Medicine Wheel in a lopsided direction, but it also taught me that healing takes patience, reflection and connection. By steadily regaining control of my physical, emotional, and spiritual well-being, I began to fathom that grief really does not mean losing someone, it means learning to carry their memory in a different manner. My grandfather's wisdom continues to be my compass in my day-to-day life.</p>

        <div className="w-full mt-8 rounded-xl border border-white/10 bg-black/30 overflow-hidden">
          <img
            src="/Medicine-Wheel-1.webp"
            alt="Medicine Wheel diagram showing the four quadrants representing Mental, Emotional, Physical, and Spiritual aspects of life"
            className="w-full h-auto block object-contain"
          />
        </div>

        <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black/40 mt-8">
          <iframe
            src="https://www.youtube.com/embed/S7nb4rJ_N14"
            title="YouTube video"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="pt-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-6" />
          <h2 className="text-xl font-semibold text-white mb-6">Works Cited</h2>
          <div className="text-white/70 text-sm leading-relaxed space-y-3">
            <p>Anderson, Amy Rees. "The Importance Of Having Balance In Our Lives." <em>Forbes</em>, 31 May 2016, <a className="underline decoration-dotted hover:text-white" href="https://www.forbes.com/sites/amyanderson/2016/05/31/the-importance-of-having-balance-in-our-lives/" target="_blank" rel="noopener noreferrer">https://www.forbes.com/sites/amyanderson/2016/05/31/the-importance-of-having-balance-in-our-lives/</a>. Accessed 25 October 2025.</p>
            
            <p><em>Florida Vacations, Travel &amp; Tourism Guide | VISIT FLORIDA</em>, <a className="underline decoration-dotted hover:text-white" href="https://www.visitflorida.com/" target="_blank" rel="noopener noreferrer">https://www.visitflorida.com/</a>. Accessed 26 October 2025.</p>
            
            <p>Joseph, Bob. "What is an Indigenous Medicine Wheel?" <em>Indigenous Corporate Training Inc.</em>, <a className="underline decoration-dotted hover:text-white" href="https://www.ictinc.ca/blog/what-is-an-indigenous-medicine-wheel" target="_blank" rel="noopener noreferrer">https://www.ictinc.ca/blog/what-is-an-indigenous-medicine-wheel</a>. Accessed 26 October 2025.</p>
            
            <p>"MLA General Format." <em>Purdue OWL</em>, <a className="underline decoration-dotted hover:text-white" href="https://owl.purdue.edu/owl/research_and_citation/mla_style/mla_formatting_and_style_guide/mla_general_format.html" target="_blank" rel="noopener noreferrer">https://owl.purdue.edu/owl/research_and_citation/mla_style/mla_formatting_and_style_guide/mla_general_format.html</a>. Accessed 26 October 2025.</p>
            
            <p>Oosthuizen, Ivan. "Are older people wiser? | Center for Practical Wisdom | The University of Chicago." <em>University of Chicago Center for Practical Wisdom</em>, 4 May 2021, <a className="underline decoration-dotted hover:text-white" href="https://wisdomcenter.uchicago.edu/news/wisdom-news/are-older-people-wiser" target="_blank" rel="noopener noreferrer">https://wisdomcenter.uchicago.edu/news/wisdom-news/are-older-people-wiser</a>. Accessed 25 October 2025.</p>
          </div>
        </div>
      </>
    )}
    {post.slug !== 'nbe-blogathon' && post.slug !== 'uncovering-my-equilibrium' && (
      <>
        <p>This is placeholder body content for <strong>{post.title}</strong>. Add your full article here. You can migrate to MDX later for headings, code blocks, images, and more.</p>
        <p>Ideas to enhance this page: table of contents, reading time, previous/next navigation, share buttons, and syntax highlighting.</p>
      </>
    )}
  </div>
      </div>
      <SimpleDock items={dockItems} />
    </div>
  );
}
