FROM node:22-bookworm-slim
ENV NODE_ENV=production STUDIO_BIND_HOST=0.0.0.0 STUDIO_CHROME_PATH=/usr/bin/chromium WHISPER_MODEL=/app/models/ggml-small.bin
RUN apt-get update && apt-get install -y --no-install-recommends chromium ffmpeg tesseract-ocr fontconfig fonts-dejavu-core python3 ca-certificates curl cmake g++ git make && rm -rf /var/lib/apt/lists/*
RUN git clone --depth 1 --branch v1.7.6 https://github.com/ggml-org/whisper.cpp.git /tmp/whisper && cmake -S /tmp/whisper -B /tmp/whisper/build -DGGML_NATIVE=OFF -DGGML_CUDA=OFF -DWHISPER_BUILD_TESTS=OFF -DWHISPER_BUILD_EXAMPLES=ON -DBUILD_SHARED_LIBS=OFF && cmake --build /tmp/whisper/build -j 1 --target whisper-cli && cp /tmp/whisper/build/bin/whisper-cli /usr/local/bin/whisper-cli && rm -rf /tmp/whisper
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p /app/.studio-state /app/voz /app/models /app/salida /home/node/.cache && chown -R node:node /app /home/node/.cache
USER node
EXPOSE 4173
CMD ["node","local.mjs"]
