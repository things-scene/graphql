# graphql

## graphql을 활용하여, 데이터를 불러오거나 수정하는 컴포넌트가 있다.

## graphql-client

**properties: endpoint**

입력받은 endpoint에 데이터를 request하는 client 컴포넌트입니다. 다른 컴포넌트에서 주로 참조하여 사용하기 때문에 ID값을 지정해주어야 합니다.

## graphql-query

**properties: client, period, query**

graphql-client의 id를 참조하여, 입력한 주기대로 해당 클라이언트에 graphql query를 통해 데이터를 요청하여 받아오는 컴포넌트입니다.

## graphql-quick-bind-query

**properties: client, period, query**

위의 graphql-query와 동일한 역할을 하지만, query에 quick-bind기능을 활용하여, 변화하는 값을 쿼리에 넣어 조회할 수 있도록 돕는 컴포넌트입니다. quick-bind 사용방법은 query문 내의 변화하는 참조값을 입력하는 부분에 \${참조할컴포넌트ID.프로퍼티명} 형식으로 입력하면 됩니다. period에 관계없이 데이터가 특정 컴포넌트 값이 변경될 때마다 가져오고 싶은 경우, graphql-quick-bind-query컴포넌트의 value 값으로 데이터를 넘겨주면, 그때마다 데이터를 새로 조회할 수 있습니다.

## graphql-quick-bind-mutation

**properties: client, updateGql**

updateGql에 따라 해당 클라이언트를 통해 데이터를 업데이트해줍니다. graphql-quick-bind-query와 마찬가지로 quick-bind 방식을 사용할 수 있습니다.

## node package를 설치한다.

`$ yarn`

## 실행

`$ yarn serve`
`$ yarn serve:dev`

## 포트를 바꾸려면, -p 3001 식으로 추가해준다.

`$ yarn serve`
`$ yarn serve -p 3001`

## test in browser

http://localhost:3000

## build

`$ yarn build`

| type | filename                   | for            | tested |
| ---- | -------------------------- | -------------- | ------ |
| UMD  | things-scene-graphql.js    | modern browser | O      |
| UMD  | things-scene-graphql-ie.js | ie 11          | O      |
| ESM  | things-scene-graphql.mjs   | modern browser | O      |

## publish

`$ yarn publish`
