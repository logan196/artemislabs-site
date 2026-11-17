# ggcoverage genome-coverage tracks. NOTE: uses the package's bundled human RNA-seq bigWigs (chr14 HNRNPC locus;
# ERR127302/3/6/7, KO vs WT) because they are the only coverage files shipped offline - not neuro data.
suppressPackageStartupMessages({library(ggcoverage); library(rtracklayer); library(ggplot2)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
d <- system.file("extdata", package = "ggcoverage"); gtf <- import.gff(file.path(d, "used_hg19.gtf"), format = "gtf")
meta <- read.csv(file.path(d, "RNA-seq", "meta_info.csv"))
trk <- LoadTrackFile(track.folder = file.path(d, "RNA-seq"), format = "bw", region = "chr14:21,677,306-21,737,601", extend = 2000, meta.info = meta)
cols <- c(KO = "#d7301f", WT = "#225ea8")
base <- ggcoverage(data = trk, plot.type = "facet", group.key = "Type", facet.key = "Type", range.position = "out", mark.region = data.frame(start = c(21678900, 21732001), end = c(21679900, 21732400), label = c("M1", "M2")), show.mark.label = TRUE)
ggsave("v1_coverage_gene.png", base + geom_gene(gtf.gr = gtf) + ggtitle("ggcoverage: RNA-seq coverage + gene models (HNRNPC locus)"), width = 10, height = 7, dpi = 130, bg = "white")
p2 <- ggcoverage(data = trk, plot.type = "facet", color = "auto", range.position = "in") + geom_transcript(gtf.gr = gtf, label.vjust = 1.5)
ggsave("v2_samples_transcripts.png", p2 + ggtitle("per-sample coverage + transcript models"), width = 10, height = 6, dpi = 130, bg = "white")
p3 <- tryCatch(base + geom_gene(gtf.gr = gtf) + geom_ideogram(genome = "hg19", plot.space = 0), error = function(e) { message("ideogram unavailable: ", conditionMessage(e)); NULL })
if (!is.null(p3)) ggsave("v3_with_ideogram.png", p3, width = 10, height = 8, dpi = 130, bg = "white")
