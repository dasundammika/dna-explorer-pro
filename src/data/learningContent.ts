export type LanguageMode = 'en' | 'si-en';
export type LearningTier = 'beginner' | 'intermediate' | 'advanced' | 'mathematical';

export interface EducationalTopic {
  id: string;
  category: 'structure' | 'pairing' | 'replication' | 'transcription' | 'chromatin';
  titleEn: string;
  titleSiEn: string;
  subtitle: string;
  keyEquation?: string;
  tiers: Record<
    LearningTier,
    {
      en: string;
      siEn: string;
      bulletPointsEn: string[];
      bulletPointsSiEn: string[];
    }
  >;
}

export const EDUCATIONAL_TOPICS: EducationalTopic[] = [
  {
    id: 'bdna-geometry',
    category: 'structure',
    titleEn: 'Canonical B-Form DNA Double Helix Architecture',
    titleSiEn: 'Canonical B-DNA Double Helix ව්‍යුහය සහ ජ්‍යාමිතිය',
    subtitle: 'Right-handed antiparallel duplex · 10.5 bp/turn · 0.34 nm axial rise',
    keyEquation: 'θ(i) = 2πi / 10.5 ,   z(i) = 0.34 · i (nm) ,   P = 3.57 nm',
    tiers: {
      beginner: {
        en: 'DNA is shaped like a twisted spiral ladder called a right-handed double helix. The two side rails are made of alternating deoxyribose sugar and phosphate groups, while the rungs inside are pairs of nitrogenous bases (A–T and G–C) holding the two strands together.',
        siEn: 'DNA අණුව දකුණු අතට කරකැවුණු ඉණිමඟක් වැනි Right-handed double helix ව්‍යුහයකින් යුක්ත වේ. මෙහි දෙපස රේල් පීලි දෙක Deoxyribose sugar සහ Phosphate කාණ්ඩ මාරුවෙන් මාරුවට බැඳුණු Sugar-phosphate backbone එකෙන් සෑදී ඇති අතර, මැද පඩි ලෙස Nitrogenous base pairs (A–T සහ G–C) පිහිටයි.',
        bulletPointsEn: [
          'Two strands coil around a shared central axis in a right-handed direction.',
          'Outer diameter is approximately 2.0 nanometers (20 Ångströms).',
          'Each step along the ladder rises by 0.34 nm (3.4 Å).',
        ],
        bulletPointsSiEn: [
          'DNA දාම දෙක පොදු මධ්‍ය අක්ෂයක් වටා Right-handed දිශාවට එතී පවතී.',
          'Double helix එකේ මුළු විෂ්කම්භය දළ වශයෙන් 2.0 nm (20 Å) වේ.',
          'එක් Base pair එකක සිට ඊළඟ Base pair එකට උස (Axial rise) 0.34 nm (3.4 Å) වේ.',
        ],
      },
      intermediate: {
        en: 'In physiological aqueous conditions, DNA predominantly adopts the B-form conformation first deduced from high-humidity X-ray fiber diffraction by Rosalind Franklin and modeled by Watson & Crick (1953). The two strands run in antiparallel orientations (one 5′→3′, the partner 3′→5′) determined by the orientation of 3′-5′ phosphodiester bonds.',
        siEn: 'සෛලීය ජලීය පරිසරය තුළ DNA ප්‍රධාන වශයෙන් B-DNA ආකාරයෙන් පවතී. මෙහි දාම දෙක Antiparallel (ප්‍රතිසමාන්තර) දිශාවන්ට විහිදේ — එනම් එක් දාමයක් 5′→3′ දිශාවටත්, අනෙක් දාමය 3′→5′ දිශාවටත් Phosphodiester bonds මගින් සම්බන්ධ වී ඇත.',
        bulletPointsEn: [
          'One complete helical turn spans ~10.5 base pairs with a pitch of 3.57 nm.',
          'Asymmetric glycosidic bond attachment creates a wide Major Groove (~2.2 nm) and a narrow Minor Groove (~1.2 nm).',
          'Negatively charged phosphate groups face outward toward water and counterions (Mg²⁺, Na⁺, histones).',
        ],
        bulletPointsSiEn: [
          'සම්පූර්ණ එක් වටයකට (Full helical turn) Base pairs ~10.5 ක් අයත් වන අතර Helical pitch එක 3.57 nm වේ.',
          'Glycosidic bonds පිහිටන කෝණයේ අසමමිතිකතාව නිසා පළල් Major groove එකක් සහ පටු Minor groove එකක් නිර්මාණය වේ.',
          'සෘණ ආරෝපිත Phosphate කාණ්ඩ පිටත ජලීය මාධ්‍යය දෙසට යොමු වී පවතී.',
        ],
      },
      advanced: {
        en: 'Unlike a naive 180°-symmetric cylinder, canonical B-DNA glycosidic C1′–N9/N1 bonds project at ~132° across the minor-groove edge and ~228° across the major-groove edge. Sequence-Specific transcription factors read hydrogen-bond donor/acceptor patterns exposed in the major groove without unwinding the duplex, while the C2′-endo furanose sugar pucker sets the 0.34 nm intrastrand phosphate-to-phosphate geometry.',
        siEn: 'සාමාන්‍ය සිලින්ඩරයක මෙන් දාම දෙක 180° කින් සමමිතිකව පිහිටන්නේ නැත; B-DNA හි Glycosidic bonds අතර කෝණය Minor groove පැත්තෙන් ~132° ක් සහ Major groove පැත්තෙන් ~228° ක් වේ. මේ නිසා Transcription factors වලට DNA දාමය විවෘත නොකරම Major groove එක තුළින් Hydrogen-bond donor/acceptor රටාවන් හඳුනාගත හැක. Deoxyribose වළල්ල C2′-endo sugar pucker වින්‍යාසය ගනී.',
        bulletPointsEn: [
          'Deoxyribose adopts the C2′-endo conformation (contrasting with C3′-endo in A-DNA and RNA duplexes).',
          'Aromatic π–π base stacking interactions along the helical axis provide the primary thermodynamic driving force for duplex stability.',
          'Local sequence context introduces subtle roll, tilt, and propeller twist variations (as observed in crystal structure 1BNA).',
        ],
        bulletPointsSiEn: [
          'B-DNA හි Deoxyribose සීනි අණුව C2′-endo conformation එක පෙන්වයි (A-DNA සහ RNA වල එය C3′-endo වේ).',
          'Base pairs එකක් මත එකක් පිහිටමින් ඇති කරන π–π Base stacking අන්තර්ක්‍රියා ද්විත්ව හෙලික්සයේ ප්‍රධාන තාපගතික ස්ථායිතාව ලබා දෙයි.',
          'PDB 1BNA වැනි සැබෑ X-ray crystallography ව්‍යුහවල අනුපිළිවෙල අනුව Propeller twist සහ Roll කෝණවල සුළු වෙනස්කම් දැකිය හැක.',
        ],
      },
      mathematical: {
        en: 'In cylindrical coordinates (r, θ, z) with helical axis along z, base-pair step i ∈ {0, 1, …, N−1} has axial height z(i) = i · h where h = 0.34 nm and azimuthal angle θ₁(i) = i · Ω where Ω = 2π / 10.5 ≈ 0.5984 rad (34.286°). The antiparallel partner strand is phase-shifted by Δφ ≈ 2.304 rad (132°): θ₂(i) = θ₁(i) + Δφ, yielding helical pitch P = 2πh / Ω = 3.57 nm.',
        siEn: 'සිලින්ඩරාකාර ඛණ්ඩාංක පද්ධතියක (r, θ, z) i වන Base pair එක සඳහා උස z(i) = i · 0.34 nm සහ කෝණය θ₁(i) = i · (2π / 10.5) ≈ 0.5984 rad (34.286°) වේ. ප්‍රතිසමාන්තර දෙවන දාමය Δφ ≈ 2.304 rad (132°) ක කලා වෙනසකින් (Phase offset) පිහිටන බැවින් θ₂(i) = θ₁(i) + Δφ වේ. සම්පූර්ණ වටයක උස (Helical pitch) P = 10.5 × 0.34 nm = 3.57 nm වේ.',
        bulletPointsEn: [
          'Strand 1 backbone vector: r₁(i) = [R cos θ₁(i), R sin θ₁(i), i · 0.34 nm] with R = 1.0 nm.',
          'Strand 2 backbone vector: r₂(i) = [R cos(θ₁(i) + Δφ), R sin(θ₁(i) + Δφ), i · 0.34 nm].',
          'Contour length L = N · 0.34 nm; total turns T = N / 10.5.',
        ],
        bulletPointsSiEn: [
          'පළමු දාමයේ ඛණ්ඩාංක: r₁(i) = [R cos θ₁(i), R sin θ₁(i), i · 0.34 nm], මෙහි R = 1.0 nm.',
          'දෙවන දාමයේ ඛණ්ඩාංක: r₂(i) = [R cos(θ₁(i) + Δφ), R sin(θ₁(i) + Δφ), i · 0.34 nm].',
          'මුළු දිග (Contour length) L = N × 0.34 nm සහ මුළු වට ගණන T = N / 10.5.',
        ],
      },
    },
  },
  {
    id: 'watson-crick-pairing',
    category: 'pairing',
    titleEn: 'Watson-Crick Base Complementarity & Hydrogen Bonding',
    titleSiEn: 'Watson-Crick Base Pairing සහ Hydrogen Bonds රසායනික විද්‍යාව',
    subtitle: 'Purine–Pyrimidine isosterism · A=T (2 H-bonds) · G≡C (3 H-bonds)',
    keyEquation: 'N_HB = 2 · N_(A+T) + 3 · N_(G+C) ,   %GC = (G + C) / N × 100%',
    tiers: {
      beginner: {
        en: 'Adenine (A) always pairs with Thymine (T) using 2 hydrogen bonds, and Guanine (G) always pairs with Cytosine (C) using 3 hydrogen bonds. Because a larger two-ring base (Purine) always pairs with a smaller one-ring base (Pyrimidine), the DNA ladder keeps a uniform width.',
        siEn: 'DNA හි Adenine (A) සෑමවිටම Thymine (T) සමඟ Hydrogen bonds 2කින්ද, Guanine (G) සෑමවිටම Cytosine (C) සමඟ Hydrogen bonds 3කින්ද බැඳේ. වළලු දෙකක Purine එකක් සෑමවිටම තනි වළල්ලක Pyrimidine එකක් සමඟ යුගල වන නිසා DNA හෙලික්සයේ පළල නියතව (2.0 nm) පවතී.',
        bulletPointsEn: [
          'Purines (Adenine, Guanine) have 2 fused rings; Pyrimidines (Thymine, Cytosine) have 1 ring.',
          'G–C pairs are stronger than A–T pairs because they have 3 hydrogen bonds instead of 2.',
          'Knowing one strand sequence automatically tells you the complementary strand.',
        ],
        bulletPointsSiEn: [
          'Purines (A, G) වළලු 2කින්ද, Pyrimidines (T, C) තනි වළල්ලකින්ද සමන්විත වේ.',
          'G–C යුගලයක Hydrogen bonds 3ක් ඇති නිසා A–T යුගලයකට (Hydrogen bonds 2) වඩා වැඩි බන්ධන ශක්තියක් ඇත.',
          'එක් දාමයක අනුපිළිවෙල දන්නා විට Complementary දාමයේ අනුපිළිවෙල නිශ්චිතවම තීරණය කළ හැක.',
        ],
      },
      intermediate: {
        en: 'Chargaff’s rules ([A] = [T] and [G] = [C]) arise directly from Watson-Crick geometric and electronic complementarity. Hydrogen bonds are directional non-covalent interactions (~2.8–3.0 Å donor-to-acceptor distance) that are strong enough to stabilize the duplex in concert, yet weak enough to be unzipped enzymatically during replication and transcription.',
        siEn: 'Chargaff ගේ නියමයන් ([A] = [T] සහ [G] = [C]) ඇති වන්නේ මෙම නිශ්චිත Watson-Crick යුගලනය නිසාය. Hydrogen bonds යනු Covalent bonds වලට වඩා දුර්වල (~2.8–3.0 Å දුරකින් පවතින) බන්ධන වර්ගයක් වන අතර, DNA ස්ථායිව තබා ගැනීමටත්, අවශ්‍ය විට Replication හා Transcription සඳහා එන්සයිම මගින් විවෘත කිරීමටත් ඉඩ සලසයි.',
        bulletPointsEn: [
          'A–T Hydrogen Bonds: N6(H) → O4 and N1 ← (H)N3.',
          'G–C Hydrogen Bonds: O6 ← (H)N4, N1(H) → N3, and N2(H) → O2.',
          'Higher GC-content elevates the thermal melting temperature (Tm) of the DNA duplex.',
        ],
        bulletPointsSiEn: [
          'A–T Hydrogen Bonds: N6(H) → O4 සහ N1 ← (H)N3 (බන්ධන 2).',
          'G–C Hydrogen Bonds: O6 ← (H)N4, N1(H) → N3, සහ N2(H) → O2 (බන්ධන 3).',
          'GC ප්‍රතිශතය වැඩි වන විට DNA දාම දෙක වෙන් කිරීමට අවශ්‍ය Melting temperature (Tm) ඉහළ යයි.',
        ],
      },
      advanced: {
        en: 'Canonical A–T and G–C base pairs are strictly isosteric: their C1′–C1′ inter-glycosidic distance is nearly identical (~10.85 Å) and the glycosidic bonds make equal ~51° angles with the C1′–C1′ vector. This isosterism allows any sequence of A, T, G, C to pack into a regular B-DNA helix without steric distortion of the sugar-phosphate backbone.',
        siEn: 'A–T සහ G–C යුගල ජ්‍යාමිතිකව සමාන (Isosteric) වේ: එනම් ඒවායේ C1′–C1′ පරමාණු අතර දුර (~10.85 Å) සහ Glycosidic bond කෝණ (~51°) එක හා සමාන වේ. මේ නිසා ඕනෑම A, T, G, C අනුපිළිවෙලකට Sugar-phosphate backbone එකේ විකෘති වීමකින් තොරව B-DNA හෙලික්සය තුළ පිහිටිය හැක.',
        bulletPointsEn: [
          'Purine–Purine pairing would cause steric clash (> 2.0 nm); Pyrimidine–Pyrimidine would leave excessive gap (< 2.0 nm).',
          'Keto-enol and amino-imino tautomerization must remain in the canonical keto/amino state to prevent transition mutations.',
          'Non-canonical Hoogsteen base pairing flips the purine 180° around the glycosidic bond (syn conformation).',
        ],
        bulletPointsSiEn: [
          'Purine දෙකක් එකතු වුවහොත් පළල වැඩි වී ගැටීම් (Steric clash) ඇති වන අතර Pyrimidine දෙකක් අතර පරතරය වැඩි වේ.',
          'භෂ්මවල Keto සහ Amino tautomeric ආකාර නිවැරදි Hydrogen bonding සඳහා අත්‍යවශ්‍ය වේ.',
          'Glycosidic බන්ධනය වටා Purine වළල්ල 180° කින් හැරුණු විට Hoogsteen base pairing ඇති විය හැක.',
        ],
      },
      mathematical: {
        en: 'For a duplex of length N base pairs with GC count N_GC and AT count N_AT = N − N_GC, the total canonical hydrogen bond count is N_HB = 2·N_AT + 3·N_GC = 2N + N_GC. For short oligonucleotides (N < 14), the Wallace rule estimates melting temperature as Tm (°C) = 2·N_AT + 4·N_GC; for longer duplexes, the Marmur-Doty relation gives Tm (°C) = 64.9 + 41·(N_GC − 16.4) / N.',
        siEn: 'දිග N වූ DNA අණුවක මුළු Hydrogen bonds ගණන N_HB = 2·N_AT + 3·N_GC = 2N + N_GC සූත්‍රයෙන් ලැබේ. කෙටි DNA කාණ්ඩ (N < 14) සඳහා Wallace සූත්‍රය මගින් Tm (°C) = 2(A+T) + 4(G+C) ලෙසද, දිගු දාම සඳහා Tm (°C) = 64.9 + 41(G+C − 16.4)/N ලෙසද තාප ස්ථායිතාව ගණනය කෙරේ.',
        bulletPointsEn: [
          'C1′–C1′ chord length: d(C1′, C1′) ≈ 1.085 nm (10.85 Å).',
          'Hydrogen bond length range: d(D···A) ∈ [0.282 nm, 0.295 nm] (2.82–2.95 Å).',
          'Purine/Pyrimidine ratio in any intact Watson-Crick double-stranded duplex is exactly 1.00.',
        ],
        bulletPointsSiEn: [
          'C1′–C1′ අතර පරතරය: d(C1′, C1′) ≈ 1.085 nm (10.85 Å).',
          'Hydrogen bond දිග පරාසය: 0.282 nm – 0.295 nm (2.82–2.95 Å).',
          'ඕනෑම ද්විත්ව දාම DNA අණුවක මුළු Purines : Pyrimidines අනුපාතය හරියටම 1.00 කි.',
        ],
      },
    },
  },
  {
    id: 'dna-replication',
    category: 'replication',
    titleEn: 'Semiconservative DNA Replication Fork Mechanics',
    titleSiEn: 'Semiconservative DNA Replication Fork ක්‍රියාවලිය',
    subtitle: 'Helicase unwinding · 5′→3′ Polymerase synthesis · Leading & Okazaki fragments',
    keyEquation: 'dNTP + DNA_n  ⟶  DNA_(n+1) + PPi   (Strictly 5′ → 3′ nucleophilic attack by 3′-OH)',
    tiers: {
      beginner: {
        en: 'Before a cell divides, it copies its DNA in a process called Replication. An enzyme called Helicase unzips the double helix into a Y-shaped Replication Fork, and DNA Polymerase builds a new partner strand for each original strand.',
        siEn: 'සෛලයක් බෙදීමට පෙර එහි DNA පිටපත් කිරීම DNA Replication ලෙස හැඳින්වේ. Helicase එන්සයිමය මගින් DNA දාම දෙක Y-හැඩැති Replication fork එකක් ලෙස වෙන් කරන අතර, DNA Polymerase එන්සයිමය මගින් එක් එක් පැරණි දාමය අච්චුවක් (Template) ලෙස ගෙන නව අනුපූරක දාම ගොඩනගයි.',
        bulletPointsEn: [
          'Semiconservative: Each new DNA molecule keeps one original strand and one newly built strand.',
          'Leading strand is built smoothly in one continuous piece toward the opening fork.',
          'Lagging strand is built in short backward segments called Okazaki fragments.',
        ],
        bulletPointsSiEn: [
          'Semiconservative ක්‍රමය: සෑදෙන සෑම නව DNA අණුවකම එක් පැරණි දාමයක් සහ එක් අලුත් දාමයක් අඩංගු වේ.',
          'Leading strand එක Replication fork එක විවෘත වන දිශාවට අඛණ්ඩව (Continuously) සංශ්ලේෂණය වේ.',
          'Lagging strand එක කෙටි කොටස් (Okazaki fragments) ලෙස කඩින් කඩ සංශ්ලේෂණය වේ.',
        ],
      },
      intermediate: {
        en: 'All known DNA polymerases can only add incoming deoxynucleoside triphosphates (dNTPs) to a free 3′-OH group, meaning synthesis proceeds exclusively in the 5′→3′ direction while reading the template strand 3′→5′. Because the two parental strands are antiparallel, the 3′→5′ parental strand supports continuous Leading-strand synthesis, whereas the 5′→3′ parental strand requires discontinuous Lagging-strand synthesis via Okazaki fragments.',
        siEn: 'සියලුම DNA Polymerase එන්සයිමවලට නව Nucleotide එකතු කළ හැක්කේ නිදහස් 3′-OH කෙළවරකට පමණි. එබැවින් නව දාමය සෑමවිටම 5′→3′ දිශාවට පමණක් ගොඩනැගේ (Template දාමය 3′→5′ දිශාවට කියවනු ලැබේ). මව් දාම දෙක Antiparallel නිසා එක් දාමයක් අඛණ්ඩවද (Leading strand), අනෙක Okazaki fragments මගින් කඩින් කඩද (Lagging strand) නිපදවේ.',
        bulletPointsEn: [
          'DNA Helicase hydrolyzes ATP to disrupt hydrogen bonds at the replication fork.',
          'Primase synthesizes short RNA primers to provide the initial free 3′-OH group.',
          'DNA Ligase seals nicked phosphodiester bonds after RNA primers are replaced.',
        ],
        bulletPointsSiEn: [
          'DNA Helicase මගින් Hydrogen bonds බිඳ දමමින් Replication fork එක ඉදිරියට ගෙන යයි.',
          'Primase එන්සයිමය ආරම්භක 3′-OH කෙළවර ලබා දීමට කෙටි RNA primer එකක් සාදයි.',
          'අවසානයේ DNA Ligase එන්සයිමය මගින් Okazaki fragments එකිනෙකට යා කරයි.',
        ],
      },
      advanced: {
        en: 'At the replisome, the 3′-OH nucleophile attacks the α-phosphate of the incoming dNTP, coordinated by two catalytic Mg²⁺ ions in the polymerase palm domain, releasing pyrophosphate (PPi) whose subsequent hydrolysis by inorganic pyrophosphatase makes polymerization thermodynamically irreversible.',
        siEn: 'DNA Polymerase සක්‍රිය මධ්‍යස්ථානයේ ඇති Mg²⁺ අයන දෙකක උපකාරයෙන් 3′-OH කාණ්ඩය පැමිණෙන dNTP අණුවේ α-phosphate මත Nucleophilic ප්‍රහාරයක් එල්ල කරයි. ඉන් නිදහස් වන Pyrophosphate (PPi) ජලවිච්ඡේදනය වීම නිසා ප්‍රතික්‍රියාව ආපසු හැරවිය නොහැකි ලෙස ඉදිරියට යයි.',
        bulletPointsEn: [
          '3′→5′ exonuclease proofreading activity increases replication fidelity to ~1 error per 10⁹–10¹⁰ nucleotides.',
          'Topoisomerases (DNA gyrase) relieve positive supercoiling torsional strain ahead of the advancing fork.',
          'Sliding clamp (PCNA in eukaryotes) tethers DNA polymerase for high processivity.',
        ],
        bulletPointsSiEn: [
          'DNA Polymerase සතු 3′→5′ exonuclease proofreading හැකියාව නිසා වැරදි සිදුවීම 10⁹ කට 1ක් දක්වා අවම වේ.',
          'Fork එකට ඉදිරියෙන් ඇතිවන අධික කරකැවීමේ ආතතිය (Supercoiling) Topoisomerase එන්සයිම මගින් ඉවත් කරයි.',
          'Sliding clamp (PCNA) ප්‍රෝටීනය මගින් Polymerase එන්සයිමය DNA දාමයෙන් ගැලවී නොයන ලෙස රඳවා තබයි.',
        ],
      },
      mathematical: {
        en: 'Note: This interactive visualization is a conceptual kinematic process animation parameterized by normalized fork progression τ ∈ [0, 1], where the fork position is y_fork(τ) = y_min + τ(y_max − y_min). It illustrates strand topology and directional polarity rather than a physically integrated molecular dynamics (MD) force-field trajectory.',
        siEn: 'සැ.යු: මෙම 3D නිරූපණය τ ∈ [0, 1] පරාමිතිය මත පදනම් වූ අධ්‍යාපනික Kinematic ආකෘතියකි (Conceptual process animation). එය Leading හා Lagging දාමවල 5′→3′ දිශානතිය පැහැදිලි කරන අතර, පූර්ණ භෞතික Molecular Dynamics (MD) සමාකරණයක් නොවේ.',
        bulletPointsEn: [
          'Fork position index: k_fork(τ) = ⌊τ · (N − 1)⌋.',
          'Leading synthesis domain: i ∈ [0, k_fork − 1] along the 3′→5′ template.',
          'Lagging Okazaki fragment m spans [m·L_ok, (m+1)·L_ok − 1] once k_fork ≥ (m+1)·L_ok.',
        ],
        bulletPointsSiEn: [
          'Replication fork ස්ථානය: k_fork(τ) = ⌊τ · (N − 1)⌋.',
          'Leading strand සංශ්ලේෂණ කලාපය: 3′→5′ අච්චු දාමය දිගේ i ∈ [0, k_fork − 1].',
          'Okazaki කාණ්ඩය m ආරම්භ වන්නේ Fork එක එම කාණ්ඩයේ 5′ ආරම්භක ලක්ෂ්‍යය පසු කළ පසුවයි.',
        ],
      },
    },
  },
  {
    id: 'rna-transcription',
    category: 'transcription',
    titleEn: 'DNA-Dependent RNA Transcription & Uracil Incorporation',
    titleSiEn: 'DNA Transcription සහ mRNA සංශ්ලේෂණය (Uracil ආදේශනය)',
    subtitle: 'Local transcription bubble · RNA Polymerase · 5′→3′ mRNA with A, U, G, C',
    keyEquation: 'Template (3′→5′)  ⟶  Nascent mRNA (5′→3′)   [A↔U, T→A, G↔C]',
    tiers: {
      beginner: {
        en: 'To use genetic instructions, the cell copies a gene from DNA into messenger RNA (mRNA) in a process called Transcription. RNA Polymerase opens a small bubble in the DNA and builds a single-stranded RNA message using A, U, G, and C (Uracil replaces Thymine in RNA).',
        siEn: 'DNA තුළ ඇති ජානමය පණිවිඩය කියවා ප්‍රෝටීන නිපදවීම සඳහා පළමුව එම කොටස mRNA බවට පිටපත් කිරීම Transcription ලෙස හැඳින්වේ. RNA Polymerase එන්සයිමය DNA දාමයේ කුඩා කොටසක් (Transcription bubble) විවෘත කර තනි දාමයකින් යුත් RNA අණුවක් සාදයි. RNA වලදී Thymine (T) වෙනුවට Uracil (U) භාවිතා වේ.',
        bulletPointsEn: [
          'Only one DNA strand (the 3′→5′ Template / Antisense strand) is read to make RNA.',
          'In RNA, Adenine (A) on the DNA template pairs with Uracil (U) instead of Thymine (T).',
          'After RNA Polymerase passes, the DNA double helix closes back up unharmed.',
        ],
        bulletPointsSiEn: [
          'RNA නිපදවීමට DNA දාම දෙකෙන් එකක් පමණක් (3′→5′ Template strand) අච්චුවක් ලෙස යොදා ගනී.',
          'DNA හි Adenine (A) ඉදිරියෙන් RNA දාමයට එකතු වන්නේ Uracil (U) නම් භෂ්මයයි.',
          'RNA Polymerase ඉදිරියට ගිය පසු DNA ද්විත්ව හෙලික්සය නැවත පෙර පරිදිම වැසී යයි.',
        ],
      },
      intermediate: {
        en: 'RNA Polymerase unwinds approximately 12–14 base pairs of DNA to form a local transcription bubble. Within the active site, ribonucleoside triphosphates (ATP, UTP, GTP, CTP) form transient Watson-Crick base pairs with the 3′→5′ template strand, forming an ~8 bp DNA–RNA hybrid helix before the 5′ end of nascent RNA exits through the RNA exit channel.',
        siEn: 'RNA Polymerase එන්සයිමය DNA දාමයේ Base pairs කිහිපයක් පමණක් විවෘත කරමින් Local transcription bubble එකක් සාදයි. එහිදී 3′→5′ Template දාමය කියවමින් 5′→3′ දිශාවට නව mRNA දාමය සංශ්ලේෂණය වේ. මෙහිදී සෑදෙන mRNA අනුපිළිවෙල 5′→3′ Coding දාමයට සමාන වන අතර T වෙනුවට U පවතී.',
        bulletPointsEn: [
          'RNA uses ribose sugar (with a 2′-OH group) instead of 2′-deoxyribose.',
          'Uracil lacks the C5 methyl group of Thymine (unmethylated 2,4-dioxypyrimidine).',
          'No primer is required: RNA Polymerase initiates de novo 5′→3′ RNA synthesis at promoters.',
        ],
        bulletPointsSiEn: [
          'RNA හි පවතින්නේ 2′-OH කාණ්ඩයක් සහිත Ribose සීනි අණුවකි.',
          'Uracil යනු Thymine හි C5 ස්ථානයේ Methyl කාණ්ඩය රහිත Pyrimidine වළල්ලයි.',
          'DNA Polymerase මෙන් නොව RNA Polymerase හට ආරම්භය සඳහා Primer එකක් අවශ්‍ය නොවේ.',
        ],
      },
      advanced: {
        en: 'Why does DNA use Thymine while RNA uses Uracil? Spontaneous hydrolytic deamination of Cytosine occurs continuously in cells, converting Cytosine into Uracil. In DNA, Uracil-DNA glycosylase (UDG) recognizes U as foreign damage and repairs it back to C. If U were a standard DNA base, repair enzymes could not distinguish mutagenic deaminated C from legitimate U.',
        siEn: 'DNA වල Thymine සහ RNA වල Uracil පවතින්නේ ඇයි? සෛල තුළ Cytosine අණු ස්වභාවිකවම ජලවිච්ඡේදනය (Deamination) වීමෙන් Uracil බවට පත්වීමේ අවදානමක් ඇත. DNA හි සම්මත භෂ්මය Thymine නිසා, DNA තුළ හමුවන ඕනෑම Uracil අණුවක් දෝෂයක් ලෙස හඳුනාගෙන අලුත්වැඩියා කිරීමට DNA repair එන්සයිමවලට හැකි වේ.',
        bulletPointsEn: [
          'Thymine’s C5-methyl tag serves as a biochemical safeguard preserving long-term genomic integrity.',
          'The 2′-OH group on RNA ribose makes phosphodiester bonds susceptible to alkaline hydrolysis, ideal for transient mRNA signaling.',
          'Eukaryotic pre-mRNA undergoes 5′ 7-methylguanosine capping, splicing, and 3′ polyadenylation.',
        ],
        bulletPointsSiEn: [
          'Thymine හි C5-methyl කාණ්ඩය දිගුකාලීන ජානමය තොරතුරු විකෘති වලින් ආරක්ෂා කරන සලකුණක් ලෙස ක්‍රියා කරයි.',
          'RNA හි 2′-OH කාණ්ඩය නිසා mRNA අණු කෙටි කාලීන පණිවිඩකරුවන් ලෙස ක්‍රියා කර පසුව පහසුවෙන් බිඳ වැටේ.',
          'සූන්‍යෂ්ටික (Eukaryotic) සෛලවල mRNA අණුව 5′ capping, splicing සහ 3′ poly-A tailing මගින් සැකසීමට ලක් වේ.',
        ],
      },
      mathematical: {
        en: 'Given a primary coding strand S_coding = s₀s₁…s_(N−1) (written 5′→3′) and antiparallel template strand S_template = c₀c₁…c_(N−1) (written 3′→5′ where c_i = comp(s_i)), transcription of the antisense template yields the 5′→3′ transcript R = r₀r₁…r_(N−1) where r_i = rnaComp(c_i) = s_i[T ↦ U].',
        siEn: '5′→3′ Coding දාමය S = s₀s₁…s_(N−1) සහ 3′→5′ Template දාමය C = c₀c₁…c_(N−1) වන විට, Antisense template දාමය කියවීමෙන් ලැබෙන 5′→3′ mRNA දාමය R = r₀r₁…r_(N−1) වේ. මෙහිදී r_i = rnaComp(c_i) වන අතර එය Coding දාමයේ T ↦ U ආදේශනයට සමාන වේ.',
        bulletPointsEn: [
          'Bubble envelope function: B(i, k_RNAP) = cos((π/2) · |i − k_RNAP| / W_b) for |i − k_RNAP| < W_b.',
          'DNA–RNA hybrid region spans [k_RNAP − 3, k_RNAP] before single-stranded RNA peel-off.',
          'Transcript length at progress τ: L_RNA(τ) = ⌊τ · (N − 1)⌋ + 1 ribonucleotides.',
        ],
        bulletPointsSiEn: [
          'Transcription bubble විවෘත වීමේ ශ්‍රිතය: B(i, k_RNAP) = cos((π/2) · |i − k_RNAP| / W_b).',
          'DNA–RNA දෙමුහුන් කලාපය (Hybrid) කෙළවරින් නව mRNA දාමය පිටතට යොමු වේ.',
          'τ ප්‍රගතියේදී නිපදවී ඇති mRNA දිග: L_RNA(τ) = ⌊τ · (N − 1)⌋ + 1 nt.',
        ],
      },
    },
  },
  {
    id: 'chromatin-packaging',
    category: 'chromatin',
    titleEn: 'Multiscale Chromatin Organization & Nucleosome Packaging',
    titleSiEn: 'Multiscale Chromatin සංවිධානය සහ Nucleosome ඇසුරුම්කරණය',
    subtitle: '2 meters of human DNA compacted ~10,000× into a 6–10 μm cell nucleus',
    keyEquation: '147 bp B-DNA  ≈  1.67 left-handed superhelical turns around Histone Octamer (H2A, H2B, H3, H4)₂',
    tiers: {
      beginner: {
        en: 'Every human cell contains about 2 meters of DNA packed inside a microscopic nucleus. To fit without tangling, DNA wraps around spool-like proteins called Histones to form Nucleosomes ("beads on a string"), which then coil into thicker Chromatin fibers.',
        siEn: 'සෑම මිනිස් සෛලයකම මීටර් 2ක් පමණ දිගැති DNA ප්‍රමාණයක් ඉතා කුඩා න්‍යෂ්ටියක් තුළ අසුරා ඇත. මෙලෙස පැටලීමකින් තොරව ඇසිරීම සඳහා DNA දාමය Histone නම් ප්‍රෝටීන බඹර (Spools) වටා එතී Nucleosomes සාදයි. ඉන්පසු ඒවා තවදුරටත් එතී Chromatin තන්තු සහ වර්ණදේහ (Chromosomes) නිර්මාණය කරයි.',
        bulletPointsEn: [
          'Level 1–2: Naked DNA nucleotides and the 2.0 nm B-DNA double helix.',
          'Level 3: Nucleosome Core Particle — DNA wrapped 1.67 times around an 8-histone protein core.',
          'Level 4–5: Arrays of nucleosomes ("beads on a string") folding into compact 30 nm chromatin fibers.',
        ],
        bulletPointsSiEn: [
          'මට්ටම 1–2: තනි Nucleotide ව්‍යුහය සහ 2.0 nm විෂ්කම්භයැති B-DNA ද්විත්ව හෙලික්සය.',
          'මට්ටම 3: Nucleosome Core Particle — Histone ප්‍රෝටීන 8ක හරයක් වටා වට 1.67ක් එතුණු 147 bp DNA කොටස.',
          'මට්ටම 4–5: මාලයක පබළු මෙන් පිහිටි Nucleosome arrays සහ ඉහළ මට්ටමේ Chromatin තන්තු.',
        ],
      },
      intermediate: {
        en: 'The fundamental repeating unit of eukaryotic chromatin is the Nucleosome Core Particle (NCP, solved at atomic resolution in PDB 1AOI by Luger et al., 1997). Exactly ~146–147 base pairs of B-DNA wrap 1.67 turns in a left-handed toroidal superhelix around a positively charged Histone Octamer composed of two copies each of core histones H2A, H2B, H3, and H4.',
        siEn: 'සූන්‍යෂ්ටික Chromatin හි මූලික ඒකකය Nucleosome Core Particle (NCP, PDB: 1AOI) වේ. මෙහිදී ධන ආරෝපිත H2A, H2B, H3, සහ H4 යන ප්‍රෝටීන යුගල දෙක බැගින් වූ Histone Octamer (ප්‍රෝටීන 8ක හරය) වටා 147 bp දිගැති B-DNA කොටසක් Left-handed දිශාවට වට 1.67ක් එතී පවතී.',
        bulletPointsEn: [
          'Histones are rich in positively charged Lysine (K) and Arginine (R) residues that neutralize DNA’s negative phosphate backbone.',
          'Linker DNA (~20–60 bp) and Linker Histone H1 connect adjacent nucleosomes into the 10 nm fiber.',
          'Euchromatin is loosely packed and transcriptionally active; Heterochromatin is densely compacted and silent.',
        ],
        bulletPointsSiEn: [
          'Histone ප්‍රෝටීනවල ඇති ධන ආරෝපිත Lysine සහ Arginine ඇමයිනෝ අම්ල මගින් DNA හි සෘණ Phosphate ආරෝපණය උදාසීන කරයි.',
          'යාබද Nucleosomes දෙකක් Linker DNA (~20–60 bp) සහ H1 histone මගින් සම්බන්ධ වේ.',
          'ලිහිල්ව ඇසිරුණු Euchromatin ජාන ප්‍රකාශනයට සක්‍රිය වන අතර තදින් ඇසිරුණු Heterochromatin නිෂ්ක්‍රිය වේ.',
        ],
      },
      advanced: {
        en: 'Wrapping stiff B-DNA (persistence length ~50 nm / 150 bp) tightly around an 11 nm nucleosome disc requires significant bending energy, compensated by >120 direct electrostatic and hydrogen-bonding contacts between histone fold domains and the DNA minor groove every ~10.2 bp. Post-translational modifications of N-terminal histone tails (acetylation, methylation, phosphorylation) form the "Histone Code" governing chromatin remodeling.',
        siEn: 'දෘඪ B-DNA අණුවක් 11 nm කුඩා Nucleosome හරයක් වටා නැමීමට විශාල ශක්තියක් අවශ්‍ය වන අතර, සෑම 10.2 bp කට වරක්ම DNA Minor groove එක සහ Histone අතර ඇතිවන ස්ථිති විද්‍යුත් බන්ධන මගින් එය ස්ථායි කෙරේ. Histone වල N-terminal tails මත සිදුවන Acetylation (උදා: H3K27ac) සහ Methylation මගින් ජාන සක්‍රිය/නිෂ්ක්‍රිය වීම පාලනය කරයි.',
        bulletPointsEn: [
          'Histone tail acetylation (by HATs) neutralizes Lysine positive charge, loosening DNA–histone contacts to promote transcription.',
          'Left-handed toroidal wrapping around the octamer stores negative writhe, which topoisomerases convert into negative supercoiling.',
          'Schematic disclaimer: Levels 3–5 here represent geometric multiscale models calibrated to nucleosome dimensions (11 nm diameter × 5.5 nm height).',
        ],
        bulletPointsSiEn: [
          'Histone acetylation මගින් Lysine හි ධන ආරෝපණය ඉවත් කර DNA ලිහිල් කරමින් Transcription පහසු කරයි.',
          'Left-handed superhelical එතීම මගින් Negative supercoiling ශක්තිය ගබඩා කරයි.',
          'විද්‍යාත්මක සටහන: 3–5 මට්ටම් Nucleosome පරිමාණයන්ට (11 nm × 5.5 nm) අනුකූලව නිර්මාණය කළ ජ්‍යාමිතික ආකෘති වේ.',
        ],
      },
      mathematical: {
        en: 'The nucleosome DNA superhelix follows a left-handed toroidal helix of major radius R_torus ≈ 4.18 nm (total particle diameter ~11.0 nm including 2.0 nm DNA cross-section), superhelical pitch P_super ≈ 2.59 nm, and turn angle Θ_total = −1.67 × 2π ≈ −10.49 rad covering L_NCP = 147 × 0.34 nm ≈ 49.98 nm of DNA contour length, achieving an axial compaction ratio of ~6–7× at the 10 nm fiber level and ~40× at the 30 nm solenoid level.',
        siEn: 'Nucleosome DNA සුපිරි හෙලික්සය ප්‍රධාන අරය R_torus ≈ 4.18 nm (මුළු විෂ්කම්භය ~11.0 nm) සහ Pitch එක P_super ≈ 2.59 nm වන Left-handed toroidal වක්‍රයක් අනුගමනය කරයි. එතුම් කෝණය Θ_total = −1.67 × 2π rad වන අතර 147 × 0.34 nm ≈ 50.0 nm දිගැති DNA කොටසක් ~5.5 nm උසකට හකුළුවයි.',
        bulletPointsEn: [
          'Superhelical centerline: X(s) = R_t cos(−ω_s s), Y(s) = −P_s · s / (2π), Z(s) = R_t sin(−ω_s s).',
          'Human diploid genome: 6.4 × 10⁹ bp × 0.34 nm/bp ≈ 2.18 meters total contour length.',
          'Approximately 3.0 × 10⁷ nucleosomes package the diploid human genome.',
        ],
        bulletPointsSiEn: [
          'Superhelical සමීකරණය: X(s) = R_t cos(−ω_s s), Y(s) = −P_s · s / (2π), Z(s) = R_t sin(−ω_s s).',
          'මිනිස් ද්විගුණ (Diploid) ජීනෝමයේ මුළු දිග: 6.4 × 10⁹ bp × 0.34 nm ≈ මීටර් 2.18.',
          'මිනිස් සෛලයක Nucleosomes මිලියන 30ක් (~3 × 10⁷) පමණ අඩංගු වේ.',
        ],
      },
    },
  },
];
