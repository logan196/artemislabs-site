suppressPackageStartupMessages({library(limma); library(edgeR); library(DESeq2)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
dds <- readRDS("../_data/airway_deseq2.rds")$dds; y <- DGEList(counts(dds)); y <- calcNormFactors(y)
design <- model.matrix(~ dds$cell + dds$dex)
# V1: voom mean-variance trend
png("v1_voom_meanvar.png", 1000, 800, res = 150); v <- voom(y, design, plot = TRUE); dev.off()
fit <- eBayes(lmFit(v, design)); cf <- ncol(design)
# V2: MDS plot
png("v2_plotMDS.png", 1000, 850, res = 150); plotMDS(v, labels = paste(dds$dex, dds$cell), col = ifelse(dds$dex == "trt", "#984EA3", "#4DAF4A"), main = "limma plotMDS"); dev.off()
# V3: MD plot with DE status
png("v3_plotMD.png", 1000, 800, res = 150); plotMD(fit, coef = cf, status = decideTests(fit)[,cf], main = "plotMD (dex)", hl.col = c("#D7301F","#2B8CBE")); abline(h=0,col="grey"); dev.off()
# V4: limma volcanoplot with top genes highlighted
png("v4_volcanoplot.png", 1000, 850, res = 150); volcanoplot(fit, coef = cf, highlight = 15, names = rownames(fit), main = "limma volcanoplot"); dev.off()
