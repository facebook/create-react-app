/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const PublicUrl = () => (
  <span id="feature-public-url">{process.env.PUBLIC_URL}.</span>
);

export default PublicUrl;
