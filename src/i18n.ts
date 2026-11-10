import { createContext, useContext } from 'react'

/* Every visible string, per locale. Scene components are shared; only this table differs.
   Product names, model names and JSON field keys are deliberately never translated. */

export type Lang = 'en-CA' | 'fr-CA'
export const LANGS: Lang[] = ['en-CA', 'fr-CA']

const en = {
  tag: 'EN-CA',
  controls: { paused: 'Paused' },
  seam: 'English version',
  chrome: {
    notes: 'Research notes · document intelligence',
    footnote: 'Illustrative visualization · fictional sample data',
    scenes: ['The problem', 'The extraction', 'The intelligence', 'The research', 'The outcome'],
  },
  fields: { invoice_number: 'Invoice number', invoice_date: 'Invoice date', vendor_name: 'Vendor name', total_amount: 'Total amount' },
  types: { string: 'string', date: 'ISO date', number: 'number' },
  invoice: {
    title: 'Invoice',
    number: 'Invoice no.',
    issued: 'Issued',
    due: 'Due',
    billTo: 'Bill to',
    from: 'From',
    attn: 'Accounts Payable',
    desc: 'Description',
    qty: 'Qty',
    rate: 'Rate',
    amount: 'Amount',
    items: ['Document review', 'Data structuring', 'Archive indexing'],
    subtotal: 'Subtotal',
    tax: 'Tax (0%)',
    total: 'Total due',
    thanks: 'Thank you.',
    terms: 'Payment within 30 days · Ref INV-2026-0042',
  },
  scene1: {
    headline: ['Every document', 'holds information.'],
    sub: 'Invoices, scans, forms, handwriting — the useful details are buried differently in every format.',
    docs: ['Digital PDF', 'Scanned invoice', 'Form', 'Handwritten note', 'Multi-page report'],
    selected: 'selected',
  },
  scene2: {
    headline: ['From documents', 'to structured data.'],
    steps: [
      { title: 'Render', desc: 'Each PDF page becomes an image' },
      { title: 'Tesseract OCR', desc: 'Recognises characters and lines — not what they mean' },
      { title: 'Mistral', desc: 'Interprets the text and returns invoice fields' },
    ],
  },
  scene3: {
    headline: ['Not every document needs', 'the same level of intelligence.'],
    inUse: 'In use · established pipeline',
    lane: [
      { title: 'Storage', sub: 'Azure Blob · local' },
      { title: 'Page images', sub: 'PDF → image' },
      { title: 'Tesseract OCR', sub: 'text recognition' },
      { title: 'Mistral', sub: 'structured extraction' },
      { title: 'JSON API', sub: 'FastAPI response' },
    ],
    research: 'Research direction · proposed, in development',
    light: 'Lightweight extraction',
    regex: 'predictable patterns',
    layout: 'learned field labels',
    checks: 'Checks',
    checkList: ['confidence', 'missing fields', 'schema validation'],
    confident: 'confident',
    uncertain: 'uncertain',
    missing: 'field missing',
    structured: { title: 'Structured fields', sub: 'schema-checked' },
    lighter: ['Use lighter methods', 'where they suffice.'],
    escalate: ['Escalate what’s uncertain.'],
    legendUse: 'In use today',
    legendResearch: 'Research direction — proposed, not yet deployed',
    footnote: 'Ordering and combination of lightweight stages are still under study',
    difficult: 'difficult cases',
  },
  scene4: {
    headline: ['Teaching smaller models', 'to understand more.'],
    stations: ['Examples', 'Mistral drafts', 'Candidate labels', 'Human review', 'Curated dataset', 'LayoutLMv3'],
    drafts: 'drafts candidate labels',
    review: 'Human review',
    actions: 'accept · correct · reject',
    offline: 'trained & evaluated offline',
    footnote: 'Only reviewed labels become training data. Training happens offline — not during live requests.',
  },
  scene5: {
    headline: ['From information', 'to answers.'],
    sample: 'illustrative sample data',
    invoice: 'Invoice',
    graph: 'conceptual graph',
    caption: 'Shared entities link documents together — a foundation for retrieval and search.',
    tagline: 'From paper to understanding.',
    verbs: 'Extract. Structure. Connect.',
  },
}

const fr: typeof en = {
  tag: 'FR-CA',
  controls: { paused: 'En pause' },
  seam: 'Version française',
  chrome: {
    notes: 'Notes de recherche · intelligence documentaire',
    footnote: 'Visualisation illustrative · données fictives',
    scenes: ['Le problème', 'L’extraction', 'L’intelligence', 'La recherche', 'Le résultat'],
  },
  fields: { invoice_number: 'Numéro de facture', invoice_date: 'Date de facturation', vendor_name: 'Nom du fournisseur', total_amount: 'Montant total' },
  types: { string: 'chaîne', date: 'date ISO', number: 'nombre' },
  invoice: {
    title: 'Facture',
    number: 'N° de facture',
    issued: 'Date',
    due: 'Échéance',
    billTo: 'Facturé à',
    from: 'De',
    attn: 'Comptes fournisseurs',
    desc: 'Description',
    qty: 'Qté',
    rate: 'Taux',
    amount: 'Montant',
    items: ['Révision de documents', 'Structuration des données', 'Indexation des archives'],
    subtotal: 'Sous-total',
    tax: 'Taxes (0 %)',
    total: 'Total dû',
    thanks: 'Merci.',
    terms: 'Paiement sous 30 jours · Réf. INV-2026-0042',
  },
  scene1: {
    headline: ['Chaque document', 'renferme', 'de l’information.'],
    sub: 'Factures, numérisations, formulaires, écriture manuscrite — l’information utile se cache différemment dans chaque format.',
    docs: ['PDF numérique', 'Facture numérisée', 'Formulaire', 'Note manuscrite', 'Rapport de plusieurs pages'],
    selected: 'sélectionné',
  },
  scene2: {
    headline: ['Des documents', 'aux données structurées.'],
    steps: [
      { title: 'Rendu', desc: 'Chaque page PDF devient une image' },
      { title: 'Tesseract OCR', desc: 'Reconnaît les caractères et les lignes — pas leur sens' },
      { title: 'Mistral', desc: 'Interprète le texte et renvoie les champs de la facture' },
    ],
  },
  scene3: {
    headline: ['Tous les documents n’exigent pas', 'le même niveau d’intelligence.'],
    inUse: 'En service · chaîne de traitement établie',
    lane: [
      { title: 'Stockage', sub: 'Azure Blob · en local' },
      { title: 'Images de pages', sub: 'PDF → image' },
      { title: 'Tesseract OCR', sub: 'reconnaissance du texte' },
      { title: 'Mistral', sub: 'extraction structurée' },
      { title: 'API JSON', sub: 'réponse FastAPI' },
    ],
    research: 'Piste de recherche · proposée, en développement',
    light: 'Extraction légère',
    regex: 'motifs prévisibles',
    layout: 'étiquettes de champs apprises',
    checks: 'Contrôles',
    checkList: ['confiance', 'champs manquants', 'validation du schéma'],
    confident: 'fiable',
    uncertain: 'incertain',
    missing: 'champ manquant',
    structured: { title: 'Champs structurés', sub: 'schéma validé' },
    lighter: ['Des méthodes légères', 'quand elles suffisent.'],
    escalate: ['Faire remonter l’incertain.'],
    legendUse: 'En service aujourd’hui',
    legendResearch: 'Piste de recherche — proposée, pas encore déployée',
    footnote: 'L’ordre et la combinaison des étapes légères sont encore à l’étude',
    difficult: 'cas difficiles',
  },
  scene4: {
    headline: ['Apprendre aux petits modèles', 'à mieux comprendre.'],
    stations: ['Exemples', 'Ébauches Mistral', 'Étiquettes candidates', 'Révision humaine', 'Jeu de données révisé', 'LayoutLMv3'],
    drafts: 'propose des étiquettes',
    review: 'Révision humaine',
    actions: 'accepter · corriger · rejeter',
    offline: 'entraîné et évalué hors ligne',
    footnote: 'Seules les étiquettes révisées deviennent des données d’entraînement. L’entraînement se fait hors ligne — jamais pendant les requêtes en direct.',
  },
  scene5: {
    headline: ['De l’information', 'aux réponses.'],
    sample: 'données d’exemple illustratives',
    invoice: 'Facture',
    graph: 'graphe conceptuel',
    caption: 'Les entités partagées relient les documents entre eux — une base pour la recherche d’information.',
    tagline: 'Du document à la compréhension.',
    verbs: 'Extraire. Structurer. Relier.',
  },
}

export const translations: Record<Lang, typeof en> = { 'en-CA': en, 'fr-CA': fr }

/** Human-readable money; JSON values stay locale-neutral. */
export const money = (lang: Lang, v: number, currency = true) =>
  new Intl.NumberFormat(lang, currency ? { style: 'currency', currency: 'CAD' } : { minimumFractionDigits: 2 }).format(v)

export const LangContext = createContext<Lang>('en-CA')
export const useLang = () => useContext(LangContext)
export const useT = () => translations[useLang()]
