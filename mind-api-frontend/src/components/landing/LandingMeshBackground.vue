<template>
  <div class="lmesh" aria-hidden="true">
    <div class="lmesh-base" />
    <div class="lmesh-blob lmesh-blob--sky-1" />
    <div class="lmesh-blob lmesh-blob--cyan" />
    <div class="lmesh-blob lmesh-blob--amber-1" />
    <div class="lmesh-blob lmesh-blob--orange" />
    <div class="lmesh-blob lmesh-blob--violet-1" />
    <div class="lmesh-blob lmesh-blob--fuchsia" />
    <div class="lmesh-blob lmesh-blob--blue-1" />
    <div class="lmesh-blob lmesh-blob--sky-2" />
    <div class="lmesh-blob lmesh-blob--sky-3" />
  </div>
</template>

<style scoped>
.lmesh {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}
.lmesh-base {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, #f8fafc, #f5f0ff, #f0f9ff);
}
.lmesh-blob {
  position: absolute;
  border-radius: 50%;
}
.lmesh-blob--sky-1 {
  left: -15%;
  top: -20%;
  height: 70vh;
  width: 75vw;
  max-height: 780px;
  max-width: 900px;
  background: #7dd3fc;
  opacity: 0.6;
  filter: blur(100px);
}
.lmesh-blob--cyan {
  left: 5%;
  top: 5%;
  height: 40vh;
  width: 45vw;
  max-height: 420px;
  max-width: 480px;
  background: #a5f3fc;
  opacity: 0.5;
  filter: blur(80px);
}
.lmesh-blob--amber-1 {
  right: -10%;
  top: -5%;
  height: 65vh;
  width: 70vw;
  max-height: 720px;
  max-width: 820px;
  background: #fde68a;
  opacity: 0.55;
  filter: blur(110px);
}
.lmesh-blob--orange {
  right: 8%;
  top: 12%;
  height: 35vh;
  width: 40vw;
  max-height: 380px;
  max-width: 420px;
  background: #fed7aa;
  opacity: 0.45;
  filter: blur(90px);
}
.lmesh-blob--violet-1 {
  left: -5%;
  top: 30%;
  height: 68vh;
  width: 72vw;
  max-height: 700px;
  max-width: 780px;
  background: #c4b5fd;
  opacity: 0.55;
  filter: blur(120px);
}
.lmesh-blob--fuchsia {
  left: 25%;
  top: 45%;
  height: 50vh;
  width: 55vw;
  max-height: 500px;
  max-width: 600px;
  background: #f0abfc;
  opacity: 0.4;
  filter: blur(100px);
}
.lmesh-blob--blue-1 {
  right: -12%;
  bottom: -15%;
  height: 72vh;
  width: 78vw;
  max-height: 760px;
  max-width: 860px;
  background: #60a5fa;
  opacity: 0.5;
  filter: blur(110px);
}
.lmesh-blob--sky-2 {
  bottom: 5%;
  right: 20%;
  height: 42vh;
  width: 48vw;
  max-height: 440px;
  max-width: 500px;
  background: #7dd3fc;
  opacity: 0.45;
  filter: blur(85px);
}
.lmesh-blob--sky-3 {
  bottom: -8%;
  left: 15%;
  height: 50vh;
  width: 60vw;
  max-height: 560px;
  max-width: 640px;
  background: #38bdf8;
  opacity: 0.35;
  filter: blur(95px);
}
</style>
