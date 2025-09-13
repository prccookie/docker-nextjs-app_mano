# ベースイメージ
FROM node:18-alpine

# 作業ディレクトリを作成
WORKDIR /app

# package.json と package-lock.json をコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# ソースコードと public フォルダをコピー
COPY . .

# ポートを開放
EXPOSE 3000

# 開発サーバーを起動
CMD ["npm", "run", "dev"]