<script lang="ts">
  import { goto } from '$app/navigation';

  let showContentPack = true;

  const steps = [
    { title: 'Upload Article', icon: '/upload_svg.svg', alt: 'Upload article' },
    { title: 'Select Platform', icon: '/task_svg.svg', alt: 'Select platform' },
    { title: 'Generate Posts', icon: '/post.svg', alt: 'Generate posts' }
  ];

  const platforms = [
    { src: '/instagram_svg.svg', alt: 'Instagram' },
    { src: '/linkedin_svg.svg', alt: 'LinkedIn' },
    { src: '/x_svg.svg', alt: 'X' },
    { src: '/tiktok_svg.svg', alt: 'TikTok' }
  ];
</script>

<svelte:head>
  <title>AI Social Content Engine</title>
  <meta
    name="description"
    content="Turn long-form content into platform-ready social posts."
  />
</svelte:head>

<section class="landing">
  <div class="hero-bg">
    <img src="/hero_social.png" alt="Hero background" />
  </div>

  <div class="page-shell">
    <nav class="nav">
      <div class="brand-wrap">
        <div class="brand-mark">✎</div>
        <div class="brand">AI Social Content Engine</div>
      </div>

      <div class="nav-links">
        <a href="/dashboard">Dashboard</a>
        <a href="/features">Features</a>
        <a href="/dashboard">Login</a>
        <button class="menu-btn" type="button" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>

    <div class="nav-divider"></div>

    <section class="hero">
      <div class="hero-copy">
        <h1>Turn Long Content Into Viral Social Media Posts</h1>
        <p>
          Upload your content. Get ready-made posts for every platform in seconds.
        </p>

        <div class="hero-actions">
          <button class="btn primary" onclick={() => goto('/dashboard')}>
            Get Started
          </button>
          <button class="btn secondary" type="button">
            <span class="play">▶</span>
            Watch Demo
          </button>
        </div>
      </div>

      <div class="hero-visual">
        <div class="app-window">
          <div class="window-bar">
            <div class="dots">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="window-actions">
              <span></span>
              <span></span>
            </div>
          </div>

          <div class="window-body">
            <h3>Upload Content</h3>

            <div class="upload-row">
              <div class="upload-field"></div>
              <button class="upload-btn" type="button">⚙ Upload File</button>
            </div>

            <div class="textarea">Paste your long-form content here...</div>

            <div class="section-title">Select Platform</div>
            <div class="platforms">
              {#each platforms as platform}
                <button class="platform-btn" type="button" aria-label={platform.alt}>
                  <img src={platform.src} alt={platform.alt} />
                </button>
              {/each}
              <button class="platform-btn muted" type="button" aria-label="More platform">
                <span>◌</span>
              </button>
            </div>

            <div class="section-title format-title">Choose Format</div>
            <div class="formats">
              <button type="button">Caption</button>
              <button type="button">Carousel</button>
              <button type="button">Video Script</button>
              <button type="button">Hook List</button>
            </div>

            <button class="generate-btn" type="button" onclick={() => goto('/dashboard')}>
              Generate Content
            </button>
          </div>
        </div>

        <div class="floating twitter">
          <img src="/x_svg.svg" alt="X" />
        </div>

        <div class="floating tiktok">
          <img src="/tiktok_svg.svg" alt="TikTok" />
        </div>

        <div class="floating instagram">
          <img src="/instagram_svg.svg" alt="Instagram" />
        </div>

        <div class="floating linkedin">
          <img src="/linkedin_svg.svg" alt="LinkedIn" />
        </div>

        {#if showContentPack}
          <div class="content-pack">
            <div class="content-pack-header">
              <h4>Your Content Pack</h4>

              <div class="pack-actions">
                <button type="button">Copy All</button>
                <button type="button">Download TXT</button>
                <button
                  type="button"
                  class="close-pack-btn"
                  aria-label="Close content pack"
                  onclick={() => (showContentPack = false)}
                >
                  ×
                </button>
              </div>
            </div>

            <div class="content-cards">
              <div class="content-card">
                <div class="card-head">
                  <span class="badge red"></span>
                  <strong>Instagram Post</strong>
                </div>
                <p><b>Hook:</b> Don’t just create, inspire! ✨</p>
                <p><b>Caption:</b> Ready to boost your...</p>
                <p><b>Hashtags:</b> #marketing #growth</p>
              </div>

              <div class="content-card">
                <div class="card-head">
                  <span class="badge blue"></span>
                  <strong>LinkedIn Post</strong>
                </div>
                <p><b>Hook:</b> Elevate your brand’s story!</p>
                <p><b>Caption:</b> Here’s how to engage...</p>
                <p><b>CTA:</b> Let’s connect!</p>
              </div>

              <div class="content-card">
                <div class="card-head">
                  <span class="badge dark"></span>
                  <strong>TikTok Script</strong>
                </div>
                <p><b>Hook:</b> Quick tips for success...</p>
                <p><b>Scene 1:</b> Hey guys, did you know...</p>
                <p><b>Scene 1:</b> They guys, did you know...</p>
              </div>
            </div>

            <div class="content-pack-footer">
              <button type="button">Copy All</button>
              <button type="button">Download TXT</button>
            </div>
          </div>
        {:else}
          <button
            type="button"
            class="reopen-pack-btn"
            aria-label="Show content pack"
            onclick={() => (showContentPack = true)}
          >
            Show Content Pack
          </button>
        {/if}
      </div>
    </section>

    <section id="features" class="steps-panel">
      {#each steps as step}
        <div class="step">
          <div class="step-icon">
            <img src={step.icon} alt={step.alt} />
          </div>
          <div class="step-title">{step.title}</div>
        </div>
      {/each}
    </section>
  </div>
</section>

<style>
  :global(body) {
    margin: 0;
    background: #120f2b;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
      sans-serif;
  }

  .landing {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    background:
      radial-gradient(circle at 20% 15%, rgba(108, 99, 255, 0.28), transparent 30%),
      radial-gradient(circle at 80% 18%, rgba(255, 182, 153, 0.2), transparent 28%),
      linear-gradient(135deg, #4b57e8 0%, #8d68dd 45%, #f39a7c 100%);
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: 0.92;
  }

  .hero-bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .page-shell {
    position: relative;
    z-index: 1;
    max-width: 1320px;
    margin: 0 auto;
    padding: 2rem 2rem 4rem;
  }

  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    color: #fff;
    padding: 0.3rem 0 1rem;
  }

  .brand-wrap {
    display: flex;
    align-items: center;
    gap: 0.7rem;
  }

  .brand-mark {
    font-size: 1.25rem;
    opacity: 0.92;
  }

  .brand {
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: 0.01em;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 2.7rem;
  }

  .nav-links a {
    color: rgba(255, 255, 255, 0.92);
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 700;
  }

  .menu-btn {
    display: inline-flex;
    flex-direction: column;
    gap: 0.28rem;
    background: transparent;
    border: 0;
    padding: 0;
    cursor: pointer;
  }

  .menu-btn span {
    width: 1.55rem;
    height: 2px;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 999px;
  }

  .nav-divider {
    height: 1px;
    width: 100%;
    background: rgba(255, 255, 255, 0.15);
  }

  .hero {
    display: grid;
    grid-template-columns: 0.95fr 1.2fr;
    gap: 2.5rem;
    align-items: start;
    padding-top: 3rem;
  }

  .hero-copy {
    color: #fff;
    padding-top: 5rem;
    max-width: 520px;
  }

  .hero-copy h1 {
    margin: 0;
    font-size: clamp(3rem, 5.2vw, 5.2rem);
    line-height: 1.05;
    font-weight: 800;
    letter-spacing: -0.04em;
  }

  .hero-copy p {
    margin: 1.9rem 0 0;
    font-size: 1.2rem;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.92);
    max-width: 430px;
  }

  .hero-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2.1rem;
  }

  .btn {
    height: 60px;
    padding: 0 2rem;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease;
  }

  .btn:hover,
  .generate-btn:hover,
  .platform-btn:hover,
  .formats button:hover,
  .upload-btn:hover,
  .pack-actions button:hover,
  .content-pack-footer button:hover,
  .close-pack-btn:hover,
  .reopen-pack-btn:hover {
    transform: translateY(-1px);
  }

  .btn.primary {
    color: #fff;
    background: linear-gradient(180deg, #ba78ff 0%, #8d5ff7 100%);
    box-shadow: 0 14px 28px rgba(91, 55, 181, 0.24);
  }

  .btn.secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
    color: #433a68;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 14px 28px rgba(40, 30, 80, 0.12);
  }

  .play {
    font-size: 0.95rem;
    line-height: 1;
  }

  .hero-visual {
    position: relative;
    min-height: 820px;
  }

  .app-window {
    position: relative;
    width: min(100%, 700px);
    margin-left: auto;
    border-radius: 22px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.96);
    box-shadow:
      0 20px 60px rgba(30, 15, 60, 0.18),
      0 8px 24px rgba(30, 15, 60, 0.1);
  }

  .window-bar {
    height: 42px;
    padding: 0 1.2rem;
    background: #2f2d5b;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dots {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .dot {
    width: 11px;
    height: 11px;
    border-radius: 999px;
  }

  .red {
    background: #fd7d70;
  }

  .yellow {
    background: #f8cc54;
  }

  .green {
    background: #7cd96a;
  }

  .window-actions {
    display: flex;
    gap: 0.5rem;
  }

  .window-actions span {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.85);
  }

  .window-body {
    padding: 1.8rem 1.8rem 1.5rem;
    background: rgba(255, 248, 252, 0.96);
  }

  .window-body h3 {
    margin: 0 0 1rem;
    font-size: 1.15rem;
    color: #2a233d;
  }

  .upload-row {
    position: relative;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f2eef8;
    border: 1px solid #e4dde9;
    border-radius: 12px;
    margin-bottom: 0.8rem;
  }

  .upload-field {
    position: absolute;
    inset: 10px;
    border-radius: 10px;
  }

  .upload-btn {
    position: relative;
    z-index: 1;
    height: 42px;
    padding: 0 1.5rem;
    border-radius: 10px;
    border: 1px solid #cfc6dc;
    background: #fff;
    font-size: 0.95rem;
    font-weight: 800;
    color: #44385e;
    box-shadow: 0 6px 14px rgba(73, 56, 112, 0.08);
    cursor: pointer;
  }

  .textarea {
    min-height: 112px;
    border-radius: 12px;
    border: 1px solid #dfd8e3;
    background: #fff;
    color: #756b85;
    font-size: 0.95rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 1.05rem;
    font-weight: 800;
    color: #2c2438;
    margin-bottom: 0.75rem;
  }

  .format-title {
    margin-top: 0.7rem;
  }

  .platforms {
    display: flex;
    gap: 0.85rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .platform-btn {
    width: 64px;
    height: 44px;
    border-radius: 10px;
    border: 1px solid #ddd5e7;
    background: #fff;
    display: grid;
    place-items: center;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(70, 52, 108, 0.05);
  }

  .platform-btn img {
    max-width: 24px;
    max-height: 24px;
    object-fit: contain;
    display: block;
  }

  .platform-btn.muted span {
    color: #8f87a4;
    font-size: 1.2rem;
    line-height: 1;
  }

  .formats {
    display: flex;
    gap: 0.7rem;
    flex-wrap: wrap;
    padding-top: 0.1rem;
    border-top: 1px solid #e6dfe9;
  }

  .formats button {
    height: 38px;
    padding: 0 1.15rem;
    margin-top: 0.8rem;
    border-radius: 10px;
    border: 1px solid #ddd5e7;
    background: #fff;
    color: #342b44;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
  }

  .generate-btn {
    width: 100%;
    height: 58px;
    margin-top: 1.2rem;
    border: 0;
    border-radius: 12px;
    color: #fff;
    font-size: 1.05rem;
    font-weight: 800;
    cursor: pointer;
    background: linear-gradient(90deg, #5864f3 0%, #d33fb6 100%);
    box-shadow: 0 14px 28px rgba(100, 68, 190, 0.18);
  }

  .floating {
    position: absolute;
    display: grid;
    place-items: center;
    filter: drop-shadow(0 16px 22px rgba(34, 24, 62, 0.16));
  }

  .floating img {
    display: block;
    object-fit: contain;
  }

  .twitter {
    right: -28px;
    top: 58px;
    width: 94px;
    height: 94px;
  }

  .twitter img {
    width: 82px;
    height: 82px;
  }

  .tiktok {
    right: -28px;
    bottom: 190px;
    width: 102px;
    height: 102px;
  }

  .tiktok img {
    width: 86px;
    height: 86px;
  }

  .instagram {
    left: -66px;
    bottom: 212px;
    width: 112px;
    height: 112px;
  }

  .instagram img {
    width: 92px;
    height: 92px;
  }

  .linkedin {
    left: 84px;
    bottom: 12px;
    width: 104px;
    height: 104px;
  }

  .linkedin img {
    width: 84px;
    height: 84px;
  }

  .content-pack {
    position: absolute;
    left: -22px;
    right: 40px;
    bottom: -16px;
    background: rgba(255, 248, 252, 0.98);
    border-radius: 18px;
    padding: 1rem 1.2rem 1rem;
    box-shadow:
      0 18px 36px rgba(31, 18, 58, 0.12),
      0 6px 16px rgba(31, 18, 58, 0.08);
  }

  .content-pack-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.9rem;
  }

  .content-pack-header h4 {
    margin: 0;
    font-size: 1rem;
    color: #2b223b;
  }

  .pack-actions,
  .content-pack-footer {
    display: flex;
    gap: 0.55rem;
  }

  .pack-actions button,
  .content-pack-footer button,
  .close-pack-btn {
    height: 34px;
    padding: 0 0.9rem;
    border-radius: 9px;
    border: 1px solid #ddd5e7;
    background: #fff;
    color: #4d4462;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
  }

  .close-pack-btn {
    width: 34px;
    min-width: 34px;
    padding: 0;
    font-size: 1.2rem;
    line-height: 1;
    display: inline-grid;
    place-items: center;
  }

  .content-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.9rem;
  }

  .content-card {
    border-radius: 12px;
    border: 1px solid #e5dde7;
    background: #fff;
    padding: 0.9rem;
    box-shadow: 0 4px 12px rgba(64, 46, 102, 0.05);
  }

  .card-head {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin-bottom: 0.7rem;
    color: #2e253e;
    font-size: 0.93rem;
  }

  .badge {
    width: 12px;
    height: 12px;
    border-radius: 4px;
    display: inline-block;
  }

  .badge.blue {
    background: #5b8dff;
  }

  .badge.dark {
    background: #161616;
  }

  .content-card p {
    margin: 0 0 0.55rem;
    font-size: 0.82rem;
    color: #44385c;
    line-height: 1.35;
  }

  .content-pack-footer {
    justify-content: flex-end;
    margin-top: 0.9rem;
  }

  .reopen-pack-btn {
    position: absolute;
    right: 40px;
    bottom: 24px;
    z-index: 3;
    height: 40px;
    padding: 0 1rem;
    border-radius: 10px;
    border: 1px solid #ddd5e7;
    background: rgba(255, 255, 255, 0.96);
    color: #4d4462;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow:
      0 12px 24px rgba(31, 18, 58, 0.1),
      0 4px 10px rgba(31, 18, 58, 0.06);
  }

  .steps-panel {
    width: 540px;
    max-width: 100%;
    margin-top: -98px;
    margin-left: 2.2rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    padding: 1.15rem 1.2rem;
    border-radius: 20px;
    background: rgba(255, 248, 252, 0.96);
    box-shadow:
      0 20px 34px rgba(34, 22, 61, 0.12),
      0 8px 18px rgba(34, 22, 61, 0.08);
    position: relative;
    z-index: 3;
  }

  .step {
    text-align: center;
    color: #2a2238;
  }

  .step-icon {
    width: 76px;
    height: 76px;
    margin: -2.2rem auto 0.7rem;
    border-radius: 999px;
    background: #f5edf8;
    display: grid;
    place-items: center;
    box-shadow: 0 8px 18px rgba(58, 38, 102, 0.12);
  }

  .step-icon img {
    width: 38px;
    height: 38px;
    object-fit: contain;
    display: block;
  }

  .step-title {
    font-size: 1rem;
    font-weight: 500;
  }

  @media (max-width: 1200px) {
    .hero {
      grid-template-columns: 1fr;
    }

    .hero-copy {
      padding-top: 1rem;
      max-width: 700px;
    }

    .hero-visual {
      min-height: 900px;
    }

    .app-window {
      margin: 0 auto;
    }

    .steps-panel {
      margin-top: -40px;
      margin-left: 0;
    }
  }

  @media (max-width: 900px) {
    .page-shell {
      padding: 1.2rem 1rem 3rem;
    }

    .nav-links {
      gap: 1rem;
    }

    .nav-links a:nth-child(2),
    .nav-links a:nth-child(3) {
      display: none;
    }

    .hero-copy h1 {
      font-size: 2.8rem;
    }

    .hero-copy p {
      font-size: 1rem;
    }

    .hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .hero-visual {
      min-height: auto;
      padding-bottom: 22rem;
    }

    .content-pack {
      left: 0;
      right: 0;
      bottom: 0;
      position: relative;
      margin-top: 1rem;
    }

    .steps-panel {
      width: 100%;
      grid-template-columns: 1fr;
      gap: 1rem;
      margin-top: 1.2rem;
    }

    .step-icon {
      margin-top: 0;
    }

    .floating {
      display: none;
    }

    .content-cards {
      grid-template-columns: 1fr;
    }

    .reopen-pack-btn {
      position: relative;
      right: auto;
      bottom: auto;
      margin-top: 1rem;
      width: 100%;
    }
  }

  @media (max-width: 640px) {
    .window-body {
      padding: 1rem;
    }

    .platforms,
    .formats {
      gap: 0.55rem;
    }

    .platform-btn {
      width: 56px;
      height: 42px;
    }

    .formats button {
      padding: 0 0.9rem;
      font-size: 0.88rem;
    }

    .content-pack-header,
    .content-pack-footer {
      flex-direction: column;
      align-items: stretch;
    }

    .pack-actions,
    .content-pack-footer {
      justify-content: stretch;
    }

    .pack-actions button,
    .content-pack-footer button {
      flex: 1;
    }

    .close-pack-btn {
      width: 100%;
    }
  }
</style>
