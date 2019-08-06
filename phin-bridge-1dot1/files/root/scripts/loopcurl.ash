#!/usr/bin/env ash
loopcurl(){
  counter=1
  while true
  do
    echo "curling..."
    curl --head https://bridge.phin.co/check
    let counter++;
    echo "count: $counter"
    sleep 10
  done
}

loopcurl
