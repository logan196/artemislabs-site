#!/usr/bin/env python3
"""Builds site/data/labs.json from facts already in our portal files.
Lab facts come from /workspace/portals/common/premium/apply.py (intro dicts),
Space READMEs on Hugging Face, and /workspace/portals/harvard/leads.md (Walsh).
Re-run after editing; nothing here is invented."""
import json, importlib.util
from pathlib import Path
spec = importlib.util.spec_from_file_location("a", "/workspace/portals/common/premium/apply.py")
A = importlib.util.module_from_spec(spec); spec.loader.exec_module(A)
HF = "https://logan-9726-{}.static.hf.space/"
SPACE = "https://huggingface.co/spaces/logan-9726/{}"
BOOK = "https://calendar.app.google/Gcn7m6neU3P3ktQA8"

INST = {
 "jhu": dict(name="Johns Hopkins University", short="Johns Hopkins", mark="JH", color="#002D72"),
 "mda": dict(name="MD Anderson Cancer Center", short="MD Anderson", mark="MD", color="#C8102E"),
 "nu": dict(name="Northwestern University", short="Northwestern", mark="N", color="#4E2A84"),
 "pitt": dict(name="University of Pittsburgh", short="Pitt", mark="Pitt", color="#003594"),
 "wustl": dict(name="Washington University School of Medicine", short="WashU Medicine", mark="W", color="#A51417"),
 "umich": dict(name="University of Michigan", short="Michigan", mark="M", color="#00274C"),
 "salk": dict(name="Salk Institute", short="Salk", mark="Salk", color="#1B5E8C"),
 "yale": dict(name="Yale School of Medicine", short="Yale", mark="Y", color="#00356B"),
 "cedars": dict(name="Cedars-Sinai", short="Cedars-Sinai", mark="CS", color="#0B4F9C"),
 "stanford": dict(name="Stanford University", short="Stanford", mark="S", color="#8C1515"),
 "ucsf": dict(name="University of California, San Francisco", short="UCSF", mark="UCSF", color="#052049"),
 "bch": dict(name="Boston Children's Hospital", short="Boston Children's", mark="BCH", color="#0A5BA8"),
 "utsw": dict(name="UT Southwestern Medical Center", short="UT Southwestern", mark="UT", color="#3D1F5C"),
}


# PI, department, headshot (official faculty or lab page; name verified on the source page), 2026-11-19
PEOPLE = {
 "walsh": ("Christopher A. Walsh, MD, PhD", "Division of Genetics and Genomics", "https://bchgenetics.org/people/christopher-walsh/"),
 "thakor": ("Avnesh S. Thakor, MD, PhD", "Radiology (Pediatric Radiology)", "https://med.stanford.edu/profiles/avnesh-thakor"),
 "young": ("Jacob Young, MD", "Neurological Surgery", "https://profiles.ucsf.edu/jacob.young"),
 "gudjonsson": ("Johann E. Gudjonsson, MD, PhD", "Dermatology", "https://data.the-asci.org/controllers/asci/DirectoryController.php?action=profile&entryId=501714"),
 "cantley": ("Lloyd G. Cantley, MD", "Internal Medicine (Nephrology)", "https://medicine.yale.edu/profile/lloyd-cantley/"),
 "kaech": ("Susan Kaech, PhD", "NOMIS Center for Immunobiology and Microbial Pathogenesis", "https://www.salk.edu/scientist/susan-kaech/"),
 "fueyo": ("Juan Fueyo, MD", "Neuro-Oncology", "https://faculty.mdanderson.org/profiles/juan_fueyo.html"),
 "park": ("Jae-Il Park, PhD", "Experimental Radiation Oncology", "https://faculty.mdanderson.org/profiles/jae-il_park.html"),
 "yang": ("Liuqing Yang, PhD", "Molecular Oncology", "https://faculty.mdanderson.org/profiles/liuqing_yang.html"),
 "garza": ("Luis A. Garza, MD, PhD", "Dermatology", "https://profiles.hopkinsmedicine.org/provider/luis-garza/2705589"),
 "gate": ("David M. Gate, PhD", "Neurology", "https://www.feinberg.northwestern.edu/faculty-profiles/az/profile.html?xid=52152"),
 "sonabend": ("Adam M. Sonabend, MD", "Neurological Surgery", "https://www.feinberg.northwestern.edu/faculty-profiles/az/profile.html?xid=38758"),
 "dai": ("Zhiyu Dai, PhD", "Medicine (Pulmonary and Critical Care)", "https://pulmonary.wustl.edu/people/zhiyu-dai-phd/"),
 "li": ("Guang Li, PhD", "Cell Biology", "https://www.cellbiology.pitt.edu/people/guang-li-phd"),
 "kusminski": ("Christine Kusminski, PhD and Philipp Scherer, PhD", "Touchstone Diabetes Center, Internal Medicine", "https://profiles.utsouthwestern.edu/profile/99704/christine-kusminski.html"),
 "bottini": ("Nunzio Bottini, MD, PhD", "Medicine (Kao Autoimmunity Institute)", "https://www.cedars-sinai.edu/health-sciences-university/research/labs/bottini.html"),
}
LOGO_SRC = {
 "jhu": "https://en.wikipedia.org/wiki/File:Johns_Hopkins_University%27s_Academic_Seal.svg",
 "mda": "https://en.wikipedia.org/wiki/File:MD_Anderson_Cancer_Center_logo.svg",
 "nu": "https://commons.wikimedia.org/wiki/File:Northwestern_University_seal.svg",
 "pitt": "https://commons.wikimedia.org/wiki/File:University_of_Pittsburgh_shield_mark.svg",
 "wustl": "https://en.wikipedia.org/wiki/File:Washington_University_in_St._Louis_seal.jpg",
 "umich": "https://commons.wikimedia.org/wiki/File:Seal_of_the_University_of_Michigan.svg",
 "salk": "https://www.salk.edu/ (site header logo)",
 "yale": "https://commons.wikimedia.org/wiki/File:Yale_University_Shield_1.svg",
 "cedars": "https://commons.wikimedia.org/wiki/File:Cedars_Sinai_Medical_Center_logo.svg",
 "stanford": "https://commons.wikimedia.org/wiki/File:Seal_of_Leland_Stanford_Junior_University.svg",
 "ucsf": "https://commons.wikimedia.org/wiki/File:University_of_California,_San_Francisco_logo.svg",
 "bch": "https://en.wikipedia.org/wiki/File:Boston_Children%27s_Hospital_logo.svg",
 "utsw": "https://github.com/logan196/kusminski-rosigipr-portal/blob/main/assets/utsw_logo.svg (UT Southwestern wordmark)",
}
WIDE = {"mda", "ucsf", "cedars", "salk", "bch", "pitt", "utsw"}

def stats(k): return [dict(value=v, label=l) for v, l in A.LABS[k]["page"]["intro"]["stats"]]
def intro(k): return A.LABS[k]["page"]["intro"]

def assay_pills(kicker, extra):
    parts = [p.strip() for p in kicker.split("·")]
    pills = [dict(label=p, on=True) for p in parts[1:]]
    pills += [dict(label=x, on=True) for x in extra]
    return pills

LATER = [dict(label="Single-cell RNA-seq", on=False), dict(label="Bulk RNA-seq", on=False), dict(label="Your unpublished cohorts", on=False)]

# (key, space, inst, dept, pi, focus, desc, extra analyzed pills)
SPATIAL = [
 ("garza", "artemis-garza-skin-xenium", "jhu", "Dermatology", None, "Skin wound regeneration", "Xenium reanalysis of mouse skin wounds, wild type vs Rnasel knockout.", ["Cell typing", "Niche analysis"]),
 ("park", "artemis-park-gastric-xenium", "mda", None, None, "Diffuse gastric cancer", "RhoA Y42C vs EKP gastric tumour neighbourhoods in Xenium.", ["Cell typing", "Neighbourhoods"]),
 ("gate", "artemis-gate-als-visium", "nu", None, None, "ALS spinal cord", "Glial and immune niches in control, sporadic and C9orf72 ALS spinal cord.", ["RNA + protein spots", "Spatial domains"]),
 ("li", "artemis-li-heart-visium", "pitt", None, None, "Heart development", "Chamber-resolved maturation across 15 developing mouse heart sections.", ["H&E images", "Chamber mapping"]),
 ("yang", "artemis-yang-liver-visium", "mda", None, "Liuqing Yang", "MASH-HCC liver", "TLS-high spots around tumour in mouse MASH-HCC, with or without anti-PD-1.", ["H&E images", "TLS scoring"]),
 ("dai", "artemis-dai-lung-xenium", "wustl", None, None, "Pulmonary hypertension", "Where endothelium sits relative to mural cells in Egln1-Tie2Cre lungs.", ["Cell typing", "Neighbourhoods"]),
 ("sonabend", "artemis-sonabend-gbm-xenium", "nu", None, None, "Glioblastoma", "T cell, myeloid and tumour-like neighbourhoods after ultrasound opening.", ["Cell typing", "Neighbourhoods"]),
 ("fueyo", "artemis-fueyo-glioma-xenium", "mda", None, None, "Glioma virotherapy", "TLS-like neighbourhoods after Delta-24-RGD in a window-of-opportunity trial.", ["Cell typing", "TLS-like cells"]),
 ("gudjonsson", "artemis-gudjonsson-skin-xenium", "umich", None, None, "Inflammatory skin disease", "Morbilliform drug eruption vs SDRIFE, with cell outlines and lasso.", ["Cell segmentation", "Cell typing"]),
 ("kaech", "artemis-kaech-pdac-xenium", "salk", None, None, "Pancreatic cancer", "Omega-3 diets in orthotopic pancreatic tumours, one section per diet.", ["Cell typing", "Neighbourhoods"]),
 ("cantley", "artemis-cantley-kidney-xenium", "yale", None, None, "Kidney injury", "Acute interstitial nephritis vs acute tubular injury in human biopsies.", ["Cell typing", "Neighbourhoods"]),
 ("bottini", "artemis-bottini-synovium-visium", "cedars", None, None, "Rheumatoid arthritis", "Two public RA synovium sections as a companion to the exTH17 story.", ["H&E images", "Gene layers"]),
]

labs = []
for k, space, inst, dept, pi, focus, desc, extra in SPATIAL:
    it = intro(k)
    acc = it["kicker"].split("·")[0].strip()
    labs.append(dict(
        id=k, name=f"{k.capitalize()} Lab", pi=pi, dept=dept, inst=inst, focus=focus,
        reports=[dict(
            id="portal", title=it["title"], kind="Spatial portal", icon="spatial",
            desc=desc, overline=focus, accession=acc, citation=it["meta"].split("·")[-1].strip(),
            subject=it["meta"].split("·")[0].strip(), stats=stats(k),
            pills=assay_pills(it["kicker"], extra) + LATER,
            note=f"{it['kicker'].split('·')[1].strip()} is analyzed today. The rest are ready to add when your lab shares them.",
            url=HF.format(space), space=SPACE.format(space), status="live")]))

YV, YF = "artemis-young-gbm-viewer", "artemis-young-gbm-foundation"
ycommon = dict(accession="BioImage Archive S-BIAD2898", citation="de Jong et al., Nature 2026", subject="Public 315-plex GBM Xenium tables (not Young Lab data)", space=SPACE.format(YV), status="live")
ypills = [dict(label="10x Xenium", on=True), dict(label="315-gene panel", on=True), dict(label="BANKSY domains", on=True), dict(label="17 sections", on=True), dict(label="Single-cell RNA-seq", on=False), dict(label="Your unpublished cohorts", on=False)]
labs.append(dict(id="young", name="Young Lab", pi="Jacob Young, MD", dept=None, inst="ucsf", focus="Glioblastoma", note="Built on the public de Jong et al., Nature 2026 Xenium tables (S-BIAD2898). Not Young Lab data.", reports=[
 dict(ycommon, id="methods", title="GBM Xenium methods comparison", kind="Report", icon="report", overline="Glioblastoma",
      desc="BANKSY vs a position-only baseline on 17 public GBM Xenium sections.", url=HF.format(YV),
      stats=[dict(value="17", label="sections"), dict(value="315", label="genes on the panel"), dict(value="126,738", label="cells in the AT4 workspace")], pills=ypills,
      note="Public de Jong et al. data is explored today. The rest are ready to add when your lab shares them."),
 dict(ycommon, id="compare", title="Method comparison workspace", kind="Workspace", icon="spatial", overline="Glioblastoma",
      desc="Three linked Vitessce panels, any of the 17 sections.", url=HF.format(YV)+"compare/index.html",
      stats=[dict(value="3", label="linked panels"), dict(value="17", label="sections")], pills=ypills,
      note="Pick a section and compare methods side by side."),
 dict(ycommon, id="banksy", title="17-section BANKSY explorer", kind="Workspace", icon="spatial", overline="Glioblastoma",
      desc="BANKSY domains across all 17 sections, up to 50,000 cells each.", url=HF.format(YV)+"banksy/workspace/index.html",
      stats=[dict(value="17", label="sections"), dict(value="50,000", label="cells per section, max")], pills=ypills,
      note="BANKSY domains are a pilot analysis by Artemis Biolabs."),
 dict(ycommon, id="briefing", title="12-slide briefing", kind="Briefing", icon="slides", overline="Glioblastoma",
      desc="The pilot in twelve slides, ready to present.", url=HF.format(YV)+"briefing/index.html",
      stats=[dict(value="12", label="slides")], pills=ypills, note="A short deck version of the report."),
 dict(ycommon, id="foundation", title="Pretrained model test", kind="Report", icon="model", overline="Glioblastoma",
      desc="Does a frozen Geneformer embedding help tell GBM tumour cells from astrocytes?", url=HF.format(YF), space=SPACE.format(YF),
      stats=[dict(value="170,000", label="cells"), dict(value="17", label="held-out sections"), dict(value="169", label="genes shared with Prime 5K")],
      pills=[dict(label="10x Xenium", on=True), dict(label="Geneformer", on=True), dict(label="Held-out tumours", on=True), dict(label="Your unpublished cohorts", on=False)],
      note="Held-out-tumour classification on public data."),
]))

TS, TG = "artemis-thakor-msc-portal", "ganguly-msc-review"
labs.append(dict(id="thakor", name="Thakor Lab", pi="Avnesh Thakor", dept=None, inst="stanford", focus="Mesenchymal stromal cells", reports=[
 dict(id="msc-atlas", title="MSC source atlas", kind="Portal", icon="atlas", overline="Mesenchymal stromal cells",
      desc="Cx43 (GJA1) across human MSC tissue sources, a public-data meta-analysis.", url=HF.format(TS), space=SPACE.format(TS), status="live",
      accession="Public data", citation="Meta-analysis", subject="Human MSCs from several tissue sources", stats=[],
      pills=[dict(label="Public expression data", on=True), dict(label="Meta-analysis", on=True), dict(label="Bulk RNA-seq", on=False), dict(label="Your unpublished cohorts", on=False)],
      note="Built from public data only."),
 dict(id="msc-review", title="MSC research review", kind="Literature review", icon="review", overline="Mesenchymal stromal cells",
      desc="A scientific literature review of Dr. Abantika Ganguly's MSC research.", url=HF.format(TG), space=SPACE.format(TG), status="live",
      accession="Published literature", citation="Literature review", subject="MSC research from the lab", stats=[],
      pills=[dict(label="Literature", on=True), dict(label="Your unpublished data", on=False)], note="A reading companion to the lab's published MSC work."),
]))

labs.append(dict(id="walsh", name="Walsh Lab", pi="Christopher A. Walsh, MD, PhD", dept="Division of Genetics and Genomics", inst="bch", focus="Human cortex development", reports=[
 dict(id="volume", title="Fetal cortex volume viewer", kind="Volume viewer", icon="volume", overline="Human cortex development",
      desc="Public MERFISH section UMB5900 BA17 in a WebGL volume viewer.", url=None, space=None, status="coming-soon",
      accession="Zenodo 10.5281/zenodo.14422018", citation="Qian et al., Nature 2025", subject="Human fetal visual cortex, gestational week 34",
      stats=[dict(value="240,659", label="cells in the section"), dict(value="GW34", label="gestational week")],
      pills=[dict(label="MERFISH", on=True), dict(label="Authors' cell types", on=True), dict(label="3D volume view", on=True), dict(label="Your unpublished cohorts", on=False)],
      note="Coming soon."),
]))

# Kusminski / Scherer: a delivered client engagement (not a public-data demo). Titles and descriptions
# come only from that portal's own pages (logan196/kusminski-rosigipr-portal: index.html, figure-tour.html).
# Names and titles verified on UTSW pages 2026-11-19: Christine Kusminski, Ph.D., Associate Professor,
# Internal Medicine / Touchstone Diabetes Center; Philipp Scherer, Ph.D., Professor, Director, Touchstone Diabetes Center.
KP = "https://logan196.github.io/kusminski-rosigipr-portal/"
kcommon = dict(status="live", space=None, accession=None, citation="Project 1 of 3", stats=[],
               subject="Rosiglitazone × GIPR-Adip adipose RNA-seq, delivered November 2026")
labs.append(dict(id="kusminski", name="Kusminski / Scherer Lab", inst="utsw", focus="Adipose biology", client=True,
  note="Client workspace. Confidential link: please don't forward outside the lab.", reports=[
 dict(kcommon, id="rosi-gipr", title="Rosi-GIPR results portal", kind="Results portal", icon="report", overline="Adipose RNA-seq",
      desc="Project 1: Rosiglitazone × GIPR-Adip adipose RNA-seq, with methods, findings, caveats and gene tables.", url=KP,
      pills=[dict(label="Bulk RNA-seq", on=True), dict(label="DESeq2", on=True), dict(label="Gene tables", on=True)],
      note="The live workspace for Project 1."),
 dict(kcommon, id="figure-tour", title="Figure tour", kind="Walkthrough", icon="slides", overline="Adipose RNA-seq",
      desc="A figure-by-figure walkthrough of the Rosi-GIPR analysis.", url=KP + "figure-tour.html",
      pills=[dict(label="Bulk RNA-seq", on=True), dict(label="Figure walkthrough", on=True)],
      note="A guided read of the Project 1 figures."),
]))

for L in labs:
    i = dict(INST[L["inst"]]); L["institution"] = i
    i["logo"] = f"assets/logos/{L['inst']}.webp"; i["logoMark"] = f"assets/logos/{L['inst']}-mark.webp"
    i["logoSource"] = LOGO_SRC[L["inst"]]; i["wide"] = L["inst"] in WIDE
    pi, dept, src = PEOPLE[L["id"]]
    L["pi"] = pi; L["dept"] = dept
    L["photo"] = f"assets/pi/{L['id']}.webp"; L["photoSource"] = src
    if (Path(__file__).resolve().parent.parent / "assets" / "hero" / f"{L['id']}.webp").exists(): L["hero"] = f"assets/hero/{L['id']}.webp"
    for r in L["reports"]: r.setdefault("pi", L.get("pi"))
order = ["kusminski","walsh","thakor","young","gudjonsson","cantley","kaech","fueyo","park","yang","garza","gate","sonabend","dai","li","bottini"]
labs.sort(key=lambda L: order.index(L["id"]))
out = dict(generated="2026-11-19", booking=BOOK, site="https://artemislabs.bio/", labs=labs)
(Path(__file__).resolve().parent.parent / "data" / "labs.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
print(len(labs), "labs,", sum(len(L["reports"]) for L in labs), "reports")
