# 避免发布，修改直接调试

if [[ -z $1 ]]; then
  echo "Enter TargetDir: "
  read -r TargetDir
else
  TargetDir=$1
fi

echo taget: $TargetDir/node_modules/vite-plugin-qiankun
npm run build
rm -rf $TargetDir/node_modules/vite-plugin-qiankun/*
# cp -rf dist/* $TargetDir/node_modules/vite-plugin-qiankun/dist/
# cp -rf es/* $TargetDir/node_modules/vite-plugin-qiankun/es/
# cp -rf package.json $TargetDir/node_modules/vite-plugin-qiankun/package.json
cp -rf `ls | grep -v node_modules | xargs` $TargetDir/node_modules/vite-plugin-qiankun/

echo "$TargetDir update success..."
