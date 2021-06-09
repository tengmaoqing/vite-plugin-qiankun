# 避免发布，修改直接调试

if [[ -z $1 ]]; then
  echo "Enter TargetDir: "
  read -r TargetDir
else
  TargetDir=$1
fi

echo taget: $TargetDir/node_modules/@tencent/vite-plugin-qiankun
npm run build
rm -rf $TargetDir/node_modules/@tencent/vite-plugin-qiankun/dist/*
cp -rf dist/* $TargetDir/node_modules/@tencent/vite-plugin-qiankun/dist/
cp -rf src/* $TargetDir/node_modules/@tencent/vite-plugin-qiankun/src/
cp -rf package.json $TargetDir/node_modules/@tencent/vite-plugin-qiankun/package.json

echo "$TargetDir update success..."
