# karyoploteR: genome-wide views of airway DE genes (hg19 coordinates via TxDb)
suppressPackageStartupMessages({library(karyoploteR); library(TxDb.Hsapiens.UCSC.hg19.knownGene); library(GenomicFeatures); library(org.Hs.eg.db); library(GenomeInfoDb)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
res <- as.data.frame(readRDS("../_data/airway_deseq2.rds")$res); res <- res[!is.na(res$padj) & !is.na(res$entrez),]
g <- genes(TxDb.Hsapiens.UCSC.hg19.knownGene); g <- g[g$gene_id %in% res$entrez]; r <- res[match(g$gene_id, res$entrez),]; g$lfc <- r$log2FoldChange; g$padj <- r$padj; g$sym <- r$symbol
g <- keepStandardChromosomes(g, pruning.mode = "coarse"); g <- g[seqnames(g) %in% paste0("chr", c(1:22, "X"))]
sig <- g[g$padj < .01]
png("v1_karyotype_density.png", 1500, 1100, res = 150); kp <- plotKaryotype("hg19", plot.type = 1, chromosomes = paste0("chr", c(1:22,"X"))); kpPlotDensity(kp, sig, col = "#c51b7d", border = NA, window.size = 2e6); kpAddMainTitle(kp, "DE-gene density (padj<0.01), 2-Mb windows"); dev.off()
png("v2_lfc_scatter_ideogram.png", 1600, 900, res = 150); kp <- plotKaryotype("hg19", plot.type = 4, chromosomes = paste0("chr", 1:22), ideogram.plotter = NULL, labels.plotter = NULL); kpAddCytobandsAsLine(kp); kpAddChromosomeNames(kp, srt = 45, cex = .6)
kpAxis(kp, ymin = -4, ymax = 4); kpPoints(kp, data = sig, y = pmax(-4, pmin(4, sig$lfc)), ymin = -4, ymax = 4, col = ifelse(sig$lfc > 0, "#d73027", "#4575b4"), cex = .4); kpAddMainTitle(kp, "log2FC of DE genes along the genome (Manhattan-like)"); dev.off()
top <- sig[order(sig$padj)][1:25]
png("v3_markers_chr.png", 1500, 1000, res = 150); kp <- plotKaryotype("hg19", chromosomes = c("chr1","chr2","chr6","chr12","chr17","chr19"), plot.type = 2); kpPlotMarkers(kp, data = top[seqnames(top) %in% c("chr1","chr2","chr6","chr12","chr17","chr19")], labels = top$sym[as.character(seqnames(top)) %in% c("chr1","chr2","chr6","chr12","chr17","chr19")], text.orientation = "horizontal", cex = .6, r1 = .9); kpPlotRegions(kp, sig, data.panel = 2, col = "#fdae61", border = NA); dev.off()
